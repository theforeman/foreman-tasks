module Actions
  class TriggerProxyBatch < Base
    include Dynflow::Action::Timeouts

    TriggerNextBatch = Algebrick.atom
    TriggerLastBatch = Algebrick.atom

    # If the event could result into sub tasks being planned, check if there are any RemoteTasks
    # to trigger after the event is processed
    #
    # The ProxyAction needs to be planned with `:use_batch_triggering => true` to activate the feature
    def run(event = nil)
      case event
      when nil
        output[:planned_count] = 0
        output[:failed_count] = 0
        output[:poll_trials] = 0
        suspend_and_ping
      when TriggerNextBatch
        trigger_remote_tasks_batch and suspend
      when TriggerLastBatch
        trigger_remote_tasks_batch and on_finish
      when Dynflow::Action::Polling::Poll
        done? ? on_finish : suspend_and_ping
      end
    end

    def trigger_remote_tasks_batch
      # Find the tasks in batches, order them by proxy_url so we get all tasks
      # to a certain proxy "close to each other"
      batch = remote_tasks.pending.order(:proxy_url, :id).first(batch_size)
      # Group the tasks by operation, in theory there should be only one operation
      batch.group_by(&:operation).each do |operation, group|
        ForemanTasks::RemoteTask.batch_trigger(operation, group)
      end
      output[:planned_count] += batch.size
    rescue => e
      action_logger.warn "Could not trigger task on the smart proxy: #{e.message}"
      batch.each { |remote_task| remote_task.update_from_batch_trigger({}) }
      output[:failed_count] += batch.size
    end

    def done?
      !input[:total_count] || output[:planned_count] >= input[:total_count]
    end

    def remote_tasks
      task.remote_sub_tasks
    end

    def on_finish
      # nothing for now
    end

    # We are trying to wait for the action to finish what it's doing, but if it does not, we timeout
    def suspend_and_ping
      process_timeout if output[:poll_trials] >= 5
      plan_event(Dynflow::Action::Polling::Poll, 8)
      suspend
    end

    private

    def batch_size
      input[:batch_size] || Setting['foreman_tasks_proxy_batch_size']
    end
  end
end
