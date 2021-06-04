require 'foreman_tasks_test_helper'

module Queries
  class TaskQueryTest < GraphQLQueryTestCase
    let(:query) do
      <<-GRAPHQL
      query (
        $id: String!
      ) {
        task(id: $id) {
          id
          action
          result
        }
      }
      GRAPHQL
    end

    let(:res) { 'inconclusive' }
    let(:task) { FactoryBot.create(:some_task, :result => res) }

    let(:global_id) { Foreman::GlobalId.for(task) }
    let(:variables) { { id: global_id } }
    let(:data) { result['data']['task'] }

    test 'should fetch task data' do
      assert_empty result['errors']

      assert_equal global_id, data['id']
      assert_equal task.result, data['result']
    end
  end
end
