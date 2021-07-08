module Actions
  class ProxyBatchTriggering < ::Actions::Base
    include ::Dynflow::Action::Polling

    TriggeringDone = Class.new

    def run(event = nil)
      case event
      when TriggeringDone
        output[:planning_finished] = true
        suspend unless done?
      when ::Dynflow::Action::Skip
        # Do nothing
      else
        super
      end
    end

    def remote_tasks
      task.remote_sub_tasks
    end

    def done?
      external_task == input[:count] ||
        ((output[:planning_finished] || [:error, :skipped, :success].include?(execution_plan.steps[input[:parent_id]].state)) && remote_tasks.none?)
    end

    def poll_external_task
      external_task + trigger_remote_tasks
    end

    def invoke_external_task
      0
    end

    private

    def trigger_remote_tasks
      # Find the tasks in batches, order them by proxy_url so we get all tasks
      # to a certain proxy "close to each other"
      triggered = 0
      remote_tasks.pending.order(:proxy_url, :id).find_in_batches(:batch_size => batch_size) do |batch|
        # Group the tasks by operation, in theory there should be only one operation
        batch.group_by(&:operation).each do |operation, group|
          ForemanTasks::RemoteTask.batch_trigger(operation, group)
          triggered += group.count
        end
      end
      triggered
    end

    def batch_size
      Setting['foreman_tasks_proxy_batch_size']
    end
  end
end
