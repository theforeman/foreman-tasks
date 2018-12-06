module ForemanTasks
  class Lock < ApplicationRecord
    class LockConflict < StandardError
      attr_reader :required_lock, :conflicting_locks
      def initialize(required_lock, conflicting_locks)
        header = <<-HEADER.gsub(/^\s+\| ?/, '')
        | #{_('Required lock is already taken by other running tasks.')}
        | #{_('Please inspect their state, fix their errors and resume them.')}
        |
        | #{_('Conflicts with tasks:')}
        HEADER
        url_helpers = Rails.application.routes.url_helpers
        conflicting_tasks = conflicting_locks
                            .map(&:task)
                            .uniq
                            .map { |task| "- #{Setting['foreman_url'] + url_helpers.foreman_tasks_task_path(task)}" }
                            .join("\n")

        super header + conflicting_tasks
        @required_lock     = required_lock
        @conflicting_locks = conflicting_locks
      end
    end

    belongs_to :task

    belongs_to :resource, polymorphic: true

    validates :task_id, :resource_id, :resource_type, presence: true
    validates :resource_id, :uniqueness => { :scope => :resource_type }

    validate do
      raise LockConflict.new(self, colliding_locks) unless available?
    end

    scope :for_resource, ->(resource) { where(:resource => resource) }

    # returns true if it's possible to acquire this kind of lock
    def available?
      !colliding_locks.exists?
    end

    # returns a scope of the locks colliding with this one
    def colliding_locks
      task_ids = task.self_and_parents.map(&:id)
      colliding_locks_scope = Lock.where(Lock.arel_table[:task_id].not_in(task_ids))
      colliding_locks_scope.where(resource_id:   resource_id,
                                  resource_type: resource_type)
    end

    class << self
      # Locks the resource so that no other task can lock it while running.
      # No other task related to the resource is not allowed (even not-locking ones)
      # A typical usecase is resource deletion, where it's good idea to make sure
      # nothing else related to the resource is really running.
      def exclusive!(resource, uuid)
        lock = build(uuid, resource)
        Link.link!(resource, uuid)
        Link.build_related_links(resource, uuid).each(&:save!)
        lock
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
        exclusive!(resource, uuid)
      end

      def colliding_locks(resource, uuid, *lock_names)
        build(uuid, resource).colliding_locks.to_a
      end

      private

      def build(uuid, resource)
        find_or_create_by(task_id:       uuid,
                          resource_type: resource.class.name,
                          resource_id:   resource.id)
      end
    end
  end
end
