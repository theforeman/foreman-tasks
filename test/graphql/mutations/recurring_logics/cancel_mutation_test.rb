require 'foreman_tasks_test_helper'

module Mutations
  module RecurringLogics
    class CancelMutationTest < ActiveSupport::TestCase
      setup do
        @task = FactoryBot.create(:dynflow_task, state: 'pending')
        @task_group = FactoryBot.create(:recurring_logic_task_group)
        @task_group_member = FactoryBot.create(:task_group_member, task: @task, task_group: @task_group)
        @recurring_logic = FactoryBot.create(:recurring_logic, task_group: @task_group)
        @id = Foreman::GlobalId.for(@recurring_logic)
        @variables = { id: @id }
        @query =
          <<-GRAPHQL
          mutation CancelRecurringLogic($id:ID!) {
            cancelRecurringLogic(input: { id: $id }){
              recurringLogic {
                id
                state
                cronLine
              }
              errors {
                message
                path
              }
            }
          }
          GRAPHQL
      end

      context 'as admin' do
        setup do
          @context = { current_user: FactoryBot.create(:user, :admin) }
        end

        test 'should cancel recurring logic' do
          assert_not_equal 'cancelled', @recurring_logic.state
          result = ForemanGraphqlSchema.execute(@query, variables: @variables, context: @context)
          assert_empty result['errors']
          assert_empty result['data']['cancelRecurringLogic']['errors']
          assert_equal 'cancelled', result['data']['cancelRecurringLogic']['recurringLogic']['state']
          @recurring_logic.reload
          assert_equal 'cancelled', @recurring_logic.state
        end

        test 'should handle errors on execution plan load failure' do
          invalid_plan = ::Dynflow::ExecutionPlan::InvalidPlan.new(StandardError.new('This is a failure'), 'xyz', 'test-label', 'invalid')
          ::Dynflow::Persistence.any_instance.stubs(:load_execution_plan).returns(invalid_plan)
          result = ForemanGraphqlSchema.execute(@query, variables: @variables, context: @context)
          assert_equal "There has been an error when canceling one of the tasks: This is a failure", result['data']['cancelRecurringLogic']['errors'].first['message']
        end
      end

      context 'as viewer' do
        setup do
          @context = { current_user: setup_user('view', 'recurring_logics') }
        end

        test 'should not allow to cancel recurring logic' do
          result = ForemanGraphqlSchema.execute(@query, variables: @variables, context: @context)
          assert_includes result['errors'].first['message'], 'Unauthorized.'
        end
      end
    end
  end
end
