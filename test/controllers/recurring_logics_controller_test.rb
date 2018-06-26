require 'test_helper'
require 'foreman_tasks_test_helper'

module ForemanTasks
  class RecurringLogicsControllerTest < ActionController::TestCase
    describe ForemanTasks::RecurringLogicsController do
      basic_index_test('recurring_logics')
      basic_pagination_per_page_test

      # rubocop:disable Naming/AccessorMethodName
      def get_factory_name
        :recurring_logic
      end
      # rubocop:enable Naming/AccessorMethodName

      describe 'PUT /recurring_logics/ID/enable' do
        let(:recurring_logic) do
          recurring_logic = FactoryBot.create(:recurring_logic)
          recurring_logic.start(::Support::DummyRecurringDynflowAction)
          recurring_logic
        end

        it 'disables' do
          put :enable, params: { :id => recurring_logic.id }, session: set_session_user
          assert_redirected_to '/foreman_tasks/recurring_logics'
        end

        it 'enables' do
          recurring_logic.update(:enabled => false)
          put :disable, params: { :id => recurring_logic.id }, session: set_session_user

          assert_redirected_to '/foreman_tasks/recurring_logics'
        end
      end
    end
  end
end
