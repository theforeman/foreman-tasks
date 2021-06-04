require 'foreman_tasks_test_helper'

module Queries
  class RecurringLogicTest < GraphQLQueryTestCase
    let(:query) do
      <<-GRAPHQL
      query($id: String!) {
        recurringLogic(id: $id) {
          id
          cronLine
        }
      }
      GRAPHQL
    end

    let(:cron_line) { '5 4 3 2 1' }
    let(:recurring_logic) { FactoryBot.create(:recurring_logic, :cron_line => cron_line) }
    let(:global_id) { Foreman::GlobalId.for(recurring_logic) }
    let(:variables) { { id: global_id } }
    let(:data) { result['data']['recurringLogic'] }

    test "should fetch recurring logic" do
      assert_empty result['errors']
      assert_equal global_id, data['id']
      assert_equal cron_line, data['cronLine']
    end
  end
end
