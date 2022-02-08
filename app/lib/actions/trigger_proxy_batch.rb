module Actions
  # This action plans proxy tasks in batches.
  # It needs to be manually notified about the next batch being available by sending a TriggerNextBatch event.
  #
  # The ProxyAction needs to be planned with `:use_batch_triggering => true` to activate the feature
  class TriggerProxyBatch < Base
    TriggerNextBatch = Algebrick.type do
      fields! batches: Integer
    end
    TriggerLastBatch = Algebrick.atom

    def run(event = nil)
      case event
      when nil
        if output[:planned_count]
          check_finish
        else
          init_counts and suspend
        end
      when TriggerNextBatch
        trigger_remote_tasks_batches(event.batches) and suspend
      when TriggerLastBatch
        trigger_remote_tasks_batch and on_finish
      when ::Dynflow::Action::Skip
        # do nothing
      end
    end

    def trigger_remote_tasks_batches(amount = 1)
      amount.times { trigger_remote_tasks_batch }
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
      action_logger.warn "Could not trigger task on the smart proxy"
      action_logger.warn e
      batch.each { |remote_task| remote_task.update_from_batch_trigger({}) }
      output[:failed_count] += batch.size
    end

    def init_counts
      output[:planned_count] = 0
      output[:failed_count] = 0
    end

    def check_finish
      if output[:planned_count] + output[:failed_count] + batch_size >= input[:total_count]
        trigger_remote_tasks_batch and on_finish
      else
        suspend
      end
    end

    def done?
      output[:planned_count] + output[:failed_count] >= input[:total_count]
    end

    def remote_tasks
      task.remote_sub_tasks
    end

    def on_finish
      # nothing for now
    end

    private

    def batch_size
      input[:batch_size] || Setting['foreman_tasks_proxy_batch_size']
    end
  end
end
