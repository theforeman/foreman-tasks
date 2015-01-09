FactoryGirl.define do
  factory :some_task, :class => ForemanTasks::Task do
    sequence(:label) { |n| "task#{n}" }
    type 'ForemanTasks::Task'
    state 'stopped'
    result 'success'

    transient do
      set_owner nil
    end

    after(:create) do |task, evaluator|
      ForemanTasks::Lock.owner!(evaluator.set_owner, task.id) if evaluator.set_owner
    end

    factory :dynflow_task, :class => ForemanTasks::Task::DynflowTask do
      label "Support::DummyDynflowAction"
      type "ForemanTasks::Task::DynflowTask"
      started_at "2014-10-01 11:15:55"
      ended_at "2014-10-01 11:15:57"
      state "stopped"
      result "success"
      parent_task_id nil

      after(:build) do |task|
        dynflow_task = ForemanTasks.dynflow.world.plan(Support::DummyDynflowAction)
        # remove the task created automatically by the persistence
        ForemanTasks::Task.where(:external_id => dynflow_task.id).delete_all
        task.external_id = dynflow_task.id
      end

      trait :user_create_task do
        label "Actions::User::Create"
      end

      trait :product_create_task do
        label "Actions::Katello::Product::Create"
      end
    end
  end
end
