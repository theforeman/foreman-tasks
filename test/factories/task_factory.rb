FactoryBot.define do
  factory :some_task, :class => ForemanTasks::Task do
    sequence(:label) { |n| "task#{n}" }
    type { 'ForemanTasks::Task' }
    state { 'stopped' }
    result { 'success' }

    factory :dynflow_task, :class => ForemanTasks::Task::DynflowTask do
      label { 'Support::DummyDynflowAction' }
      type { 'ForemanTasks::Task::DynflowTask' }
      started_at { '2014-10-01 11:15:55' }
      ended_at { '2014-10-01 11:15:57' }
      state { 'stopped' }
      result { 'success' }
      parent_task_id { nil }

      transient do
        sync_with_dynflow { false }
      end

      after(:build) do |task, evaluator|
        execution_plan = ForemanTasks.dynflow.world.plan(Support::DummyDynflowAction)
        # remove the task created automatically by the persistence
        ForemanTasks::Task.where(:external_id => execution_plan.id).delete_all
        task.update!(:external_id => execution_plan.id)
        if evaluator.sync_with_dynflow
          task.update_from_dynflow(execution_plan.to_hash)
        end
      end

      trait :user_create_task do
        label { 'Actions::User::Create' }
      end

      trait :product_create_task do
        label { 'Actions::Katello::Product::Create' }
      end

      trait :inconsistent_dynflow_task do
        after(:build) do |task|
          task.update!(:state => 'running')
        end
      end

      factory :task_with_links do
        # posts_count is declared as a transient attribute and available in
        # attributes on the factory, as well as the callback via the evaluator
        transient do
          locks_count { 1 }
          resource_id { 1 }
          resource_type { 'type1' }
        end

        # the after(:create) yields two values; the user instance itself and the
        # evaluator, which stores all values from the factory, including transient
        # attributes; `create_list`'s second argument is the number of records
        # to create and we make sure the user is associated properly to the post
        after(:create) do |task, evaluator|
          create_list(
            :link,
            1,
            task: task,
            resource_type: evaluator.resource_type,
            resource_id: evaluator.resource_id
          )
        end
      end

      factory :task_with_locks do
        # posts_count is declared as a transient attribute and available in
        # attributes on the factory, as well as the callback via the evaluator
        transient do
          resource_id { 1 }
          resource_type { 'type1' }
        end

        # the after(:create) yields two values; the user instance itself and the
        # evaluator, which stores all values from the factory, including transient
        # attributes; `create_list`'s second argument is the number of records
        # to create and we make sure the user is associated properly to the post
        after(:create) do |task, evaluator|
          create_list(
            :lock,
            1,
            task: task,
            resource_type: evaluator.resource_type,
            resource_id: evaluator.resource_id
          )
        end
      end
    end
  end

  factory :link, :class => ForemanTasks::Link do
    resource_type { 'Katello::Repository' }
    resource_id { 1 }
    association :task, factory: :task_with_links
  end

  factory :lock, :class => ForemanTasks::Lock do
    resource_type { 'Katello::Repository' }
    resource_id { 1 }
    association :task, factory: :task_with_locks
  end
end
