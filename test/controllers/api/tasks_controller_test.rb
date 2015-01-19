require "foreman_tasks_test_helper"

module ForemanTasks
  class Api::TasksControllerTest < ActionController::TestCase
    describe 'tasks api controller' do
      tests ForemanTasks::Api::TasksController

      before do
        User.current = User.where(:login => 'apiadmin').first
        @request.env['HTTP_ACCEPT'] = 'application/json'
        @request.env['CONTENT_TYPE'] = 'application/json'
        @task = FactoryGirl.create(:dynflow_task, :user_create_task)
      end

      it 'searches for task on GET' do
        get(:show, :id => @task.id)
        assert_response :success
        assert_template 'api/tasks/show'
      end

    end
  end
end
