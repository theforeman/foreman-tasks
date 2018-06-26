require 'foreman_tasks_test_helper'

module ForemanRecurringLogic
  class Api::RecurringLogicControllerTest < ActionController::TestCase
    describe 'recurring logic api controller' do
      tests ForemanTasks::Api::RecurringLogicsController

      before do
        User.current = User.where(:login => 'apiadmin').first
        @request.env['HTTP_ACCEPT'] = 'application/json'
        @request.env['CONTENT_TYPE'] = 'application/json'
        @recurring_logic = FactoryBot.create(:recurring_logic)
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
          get :show, params: { :id => @recurring_logic.id }
          assert_response :success
          assert_template 'api/recurring_logics/show'
        end
      end

      describe 'PUT /api/recurring_logics/:id' do
        it 'updates a recurring logic' do
          @recurring_logic.start(::Support::DummyRecurringDynflowAction)

          put :update, params: { :id => @recurring_logic.id, :recurring_logic => { :enabled => false } }
          assert_response :success
          assert_template 'api/recurring_logics/update'
          assert @recurring_logic.reload.disabled?
        end
      end

      describe 'POST /api/recurring_logics/:id/cancel' do
        it 'cancels recurring logic' do
          post :cancel, params: { :id => @recurring_logic.id }
          assert_response :success
          @recurring_logic.reload
          assert @recurring_logic.state == 'cancelled'
        end
      end
    end
  end
end
