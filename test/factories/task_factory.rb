FactoryGirl.define do
  factory :user_create_task, :class => ForemanTasks::Task do
    id "6c0bf393-b971-408b-b1ba-db3b36b7d3ff"
    type "ForemanTasks::Task::DynflowTask"
    label "Actions::User::Create"
    started_at "2014-10-01 11:15:55"
    ended_at "2014-10-01 11:15:57"
    state "stopped"
    result "success"
    external_id "26711da2-24f3-40cd-bb97-8b6b95be1e16"
    parent_task_id nil
  end

  factory :product_create_task, :class => ForemanTasks::Task do
    id "6f1ee928-ec74-4e48-88e7-e7233bc4fefa"
    type "ForemanTasks::Task::DynflowTask"
    label "Actions::Katello::Product::Create"
    started_at "2014-10-02 11:57:13"
    ended_at "2014-10-02 11:57:15"
    state "stopped"
    result "success"
    external_id "0e6f3adc-416f-4c44-b531-b81f296603f3"
    parent_task_id nil
  end
end