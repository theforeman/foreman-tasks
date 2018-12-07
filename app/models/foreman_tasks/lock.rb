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

    validate do
      raise LockConflict.new(self, colliding_locks) if colliding_locks.any?
    end

    scope :for_resource, ->(resource) { where(:resource => resource) }

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
      # It also creates a Link between the task and the resource and between the task
      # and all related resources.
      def exclusive!(resource, task)
        lock = build(resource, task)
        lock.save!
        ForemanTasks::Link.link_resource_and_related!(resource, task)
        lock
      end

      # See #exclusive!
      def lock!(resource, task, *_lock_names)
        exclusive!(resource, task)
      end

      def colliding_locks(resource, task, *_lock_names)
        build(resource, task).colliding_locks.to_a
      end

      private

      def build(resource, task)
        find_or_initialize_by(task_id:       task.id,
                              resource_type: resource.class.name,
                              resource_id:   resource.id)
      end
    end
  end
end
