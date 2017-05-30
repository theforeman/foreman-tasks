module ActiveJob
  module QueueAdapters
    # To use ForemanTasks, set the queue_adapter config to +:foreman_tasks+.
    #
    #   Rails.application.config.active_job.queue_adapter = :foreman_tasks
    class ForemanTasksJobAdapter
      extend ActiveSupport::Concern
      include ForemanTasks::Triggers

      def enqueue(job) #:nodoc:
        task = async_task(job.action, job.args*, &block)
        task
      end

      def enqueue_at(job, timestamp) #:nodoc:
        task = delay(job.action, { :start_at => timestamp }, job.args*, &block)
        task
      end
    end
  end
end
