require 'foreman_tasks_test_helper'

module ForemanRecurringLogic
  class Api::RecurringLogicControllerTest < ActionController::TestCase
    describe 'recurring logic api controller' do
      tests ForemanTasks::Api::RecurringLogicsController

      before do
        User.current = User.where(:login => 'apiadmin').first
        @request.env['HTTP_ACCEPT'] = 'application/json'
        @request.env['CONTENT_TYPE'] = 'application/json'
        @recurring_logic = FactoryGirl.create(:recurring_logic)
      end

      describe 'GET /api/recurring_logics' do
        it 'gets index' do
          get :index
          assert_response :success
          assert_template 'api/recurring_logics/index'
        end
      end

      describe 'GET /api/recurring_logics/:id' do
        it 'searches for recurring logic' do
          get :show, :id => @recurring_logic.id
          assert_response :success
          assert_template 'api/recurring_logics/show'
        end
      end

      describe 'POST /api/recurring_logics/:id/cancel' do
        it 'cancels recurring logic' do
          post :cancel, :id => @recurring_logic.id
          assert_response :success
          @recurring_logic.reload
          assert @recurring_logic.state == 'cancelled'
        end
      end
    end
  end
end
