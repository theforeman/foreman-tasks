FactoryBot.define do
  factory :recurring_logic, :class => ForemanTasks::RecurringLogic do
    cron_line { '* * * * *' }
    association :task_group
  end

  factory :task_group, :class => ::ForemanTasks::TaskGroup do
    type { "ForemanTasks::TaskGroups::RecurringLogicTaskGroup" }
  end
  factory :recurring_logic_task_group, :class => ::ForemanTasks::TaskGroups::RecurringLogicTaskGroup
  factory :task_group_member, :class => ::ForemanTasks::TaskGroupMember do
    association :task_group, :task
  end
end
