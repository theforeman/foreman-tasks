require 'foreman_tasks_test_helper'

module ForemanRecurringLogic
  class Api::TaskSchedulesControllerTest < ActionController::TestCase
    describe 'task schedules api controller' do
      tests ForemanTasks::Api::TaskSchedulesController

      before do
        User.current = User.where(:login => 'apiadmin').first
        @request.env['HTTP_ACCEPT'] = 'application/json'
        @request.env['CONTENT_TYPE'] = 'application/json'
        @recurring_logic = FactoryGirl.create(:recurring_logic)
      end

      describe 'GET /api/task_schedules' do
        it 'gets index' do
          get :index
          assert_response :success
          assert_template 'api/task_schedules/index'
        end
      end

      describe 'GET /api/task_schedules/:id' do
        it 'searches for recurring logic' do
          get :show, :id => @recurring_logic.id
          assert_response :success
          assert_template 'api/task_schedules/show'
        end
      end

      describe 'POST /api/task_schedules/:id/cancel' do
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
