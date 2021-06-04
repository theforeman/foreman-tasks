require 'foreman_tasks_test_helper'

module Queries
  class TasksQueryTest < GraphQLQueryTestCase
    let(:query) do
      <<-GRAPHQL
      query {
        tasks {
          nodes {
            id
            action
            result
          }
        }
      }
      GRAPHQL
    end

    let(:data) { result['data']['tasks'] }

    setup do
      FactoryBot.create_list(:some_task, 2)
    end

    test "should fetch recurring logics" do
      assert_empty result['errors']
      expected_count = ::ForemanTasks::Task.count
      assert_not_equal 0, expected_count
    end
  end
end
