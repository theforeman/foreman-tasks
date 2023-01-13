object @recurring_logic

attributes :id, :cron_line, :end_time, :iteration, :task_group_id, :state,
           :max_iteration, :purpose

node(:task_count) { |rl| rl.tasks.count }
node(:action) { |rl| rl.tasks.first.try(:action) }
node(:last_occurence) { |rl| rl.last_task&.started_at }
node(:next_occurence) { |rl| rl.next_task&.start_at }
