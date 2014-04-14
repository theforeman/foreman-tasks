module ForemanTasks
  class Lock < ActiveRecord::Base

    LINK_LOCK_NAME  = :link_resource
    OWNER_LOCK_NAME = :task_owner

    # not really intedet to be created in database, but it's used for
    # explicitly stating that the all the locks for resource should be used
    ALL_LOCK_NAME   = :all

    RESERVED_LOCK_NAMES = [LINK_LOCK_NAME, OWNER_LOCK_NAME, ALL_LOCK_NAME]

    class LockConflict < StandardError
      attr_reader :required_lock, :conflicting_locks
      def initialize(required_lock, conflicting_locks)
        super("required lock: #{required_lock} conflicts wiht #{conflicting_locks.inspect}")
        @required_lock     = required_lock
        @conflicting_locks = conflicting_locks
      end
    end

    belongs_to :task

    belongs_to :resource, polymorphic: true

    scope :active, -> do
      joins(:task).where('foreman_tasks_tasks.state != ?', :stopped)
    end

    validates :task_id, :name, :resource_id, :resource_type, presence: true

    validate do
      unless available?
        raise LockConflict.new(self, colliding_locks)
      end
    end

    # returns true if it's possible to aquire this kind of lock
    def available?
      not colliding_locks.any?
    end

    # returns a scope of the locks colliding with this one
    def colliding_locks
      colliding_locks_scope = Lock.active.where('foreman_tasks_locks.task_id != ?', task_id)
      colliding_locks_scope = colliding_locks_scope.where(name:          name,
                                                        resource_id:   resource_id,
                                                        resource_type: resource_type)
      unless self.exclusive?
        colliding_locks_scope = colliding_locks_scope.where(:exclusive => true)
      end
      return colliding_locks_scope
    end

    class << self

      # Locks the resource so that no other task can lock it while running.
      # No other task related to the resource is not allowed (even not-locking ones)
      # A typical usecase is resource deletion, where it's good idea to make sure
      # nothing else related to the resource is really running.
      def exclusive!(resource, uuid)
        build_exclusive_locks(resource, uuid).each(&:save!)
      end

      def exclusive?(resource)
        build_exclusive_locks(resource).all?(&:available?)
      end


      # Locks the resource so that no other task can lock it while running.
      # Other not-locking tasks are tolerated.
      #
      # The lock names allow to specify what locks should be activated. It has to
      # be a subset of names defined in model's class available_locks method
      #
      # When no lock name is specified, the resource is locked against all the available
      # locks.
      #
      # It also looks at +related_resources+ method of the resource to calcuate all
      # the related resources (recursively) and links the task to them as well.
      def lock!(resource, uuid, *lock_names)
        build_locks(resource, lock_names, uuid).each(&:save!)
      end

      def lockable?(resource, uuid, *lock_names)
        build_locks(resource, lock_names, uuid).all?(&:available?)
      end

      def locked?(resource, uuid, *lock_names)
        not lockable?(resource, uuid, *lock_names)
      end

      def colliding_locks(resource, uuid, *lock_names)
        build_locks(resource, lock_names, uuid).
            inject([]) { |arr, lock| arr + lock.colliding_locks.to_a }
      end

      # Assigns the resource to the task to easily track the task in context of
      # the resource. This doesn't prevent other actions to lock the resource
      # and should be used only for actions that tolerate other actions to be
      # performed on the resource. Usually, this shouldn't needed to be done
      # through the action directly, because the lock should assign it's parrent
      # objects to the action srecursively (using +related_resources+ method in model
      # objects)
      def link!(resource, uuid)
        build_link(resource, uuid).save!
      end

      def link?(resource, uuid)
        build_link(resource, uuid).available?
      end

      # Records the information about the user that triggered the task
      def owner!(user, uuid)
        build_owner(user, uuid).save!
      end

      private

      def all_lock_names(resource, include_links = false)
        lock_names = []
        if resource.class.respond_to?(:available_locks) &&
            resource.class.available_locks.any?
          lock_names.concat(resource.class.available_locks)
        else
          raise "The resource #{resource.class.name} doesn't define any available lock"
        end
        if lock_names.any? { |lock_name| RESERVED_LOCK_NAMES.include?(lock_name) }
          raise "Lock name #{lock_name} is reserved"
        end
        lock_names.concat([LINK_LOCK_NAME, OWNER_LOCK_NAME]) if include_links
        return lock_names
      end

      def build_exclusive_locks(resource, uuid = nil)
        build_locks(resource, all_lock_names(resource, true), uuid)
      end

      def build_locks(resource, lock_names, uuid = nil)
        locks = []
        if lock_names.empty? || lock_names == [:all]
          lock_names = all_lock_names(resource)
        end
        lock_names.map do |lock_name|
          locks << build(uuid, resource, lock_name, true)
        end
        locks.concat(build_links(resource, uuid))
        return locks
      end

      def build_links(resource, uuid = nil)
        related_resources(resource).map do |related_resource|
          build_link(related_resource, uuid)
        end
      end

      def build_link(resource, uuid = nil)
        build(uuid, resource, LINK_LOCK_NAME, false)
      end

      def build_owner(user, uuid = nil)
        build(uuid, user, OWNER_LOCK_NAME, false)
      end

      def build(uuid, resource, lock_name, exclusive)
        self.new(task_id:       uuid,
                 name:          lock_name,
                 resource_type: resource.class.name,
                 resource_id:   resource.id,
                 exclusive:     !!exclusive)
      end

      # recursively search for related resources of the resource (using
      # the +related_resources+ method, avoiding the cycles
      def related_resources(resource)
        if resource.respond_to?(:all_related_resources)
          return resource.all_related_resources
        else
          return []
        end
      end
    end

  end
end
