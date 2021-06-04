require 'foreman_tasks_test_helper'

module Queries
  class RecurringLogicsTest < GraphQLQueryTestCase
    let(:query) do
      <<-GRAPHQL
      query {
        recurringLogics {
          nodes {
            id
            cronLine
          }
        }
      }
      GRAPHQL
    end

    let(:data) { result['data']['recurringLogics'] }

    setup do
      FactoryBot.create_list(:recurring_logic, 2)
    end

    test "should fetch recurring logics" do
      assert_empty result['errors']
      expected_count = ::ForemanTasks::RecurringLogic.count
      assert_not_equal 0, expected_count
    end
  end
end
