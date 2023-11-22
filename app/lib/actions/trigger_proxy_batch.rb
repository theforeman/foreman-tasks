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
        trigger_remote_tasks_batches(event.batches)
      when TriggerLastBatch
        output[:planning_finished] = true
        trigger_remote_tasks_batches
      when ::Dynflow::Action::Skip
        # do nothing
      end
    end

    def trigger_remote_tasks_batches(amount = 1)
      amount.times { trigger_remote_tasks_batch }
      done? ? on_finish : suspend
    end

    def trigger_remote_tasks_batch
      # Find the tasks in batches, order them by proxy_url so we get all tasks
      # to a certain proxy "close to each other"
      batch = remote_tasks.pending.order(:proxy_url, :id).first(batch_size)
      # Group the tasks by operation, in theory there should be only one operation
      batch.group_by(&:operation).each do |operation, group|
        ForemanTasks::RemoteTask.batch_trigger(operation, group)
        output[:planned_count] += group.size
      end
    rescue => e
      action_logger.warn "Could not trigger task on the smart proxy"
      action_logger.warn e
      # The response contains non-serializable objects
      # TypeError: no _dump_data is defined for class Monitor
      e.response = nil
      batch.each { |remote_task| remote_task.update_from_batch_trigger({ 'exception' => e }) }
      output[:failed_count] += batch.size
    end

    def init_counts
      output[:planned_count] = 0
      output[:failed_count] = 0
    end

    def check_finish
      return on_finish if done?

      # If we're not done yet, try to trigger anything (if available)
      # and then either finish or suspend
      trigger_remote_tasks_batches
    end

    def done?
      # We're done when we've either:
      # - dispatched everything
      # - received the last message
      output[:planned_count] + output[:failed_count] >= input[:total_count] || output[:planning_finished]
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
