require "foreman_tasks_test_helper"

module ForemanTasks
  class Api::TasksControllerTest < ActionController::TestCase
    describe 'tasks api controller' do
      tests ForemanTasks::Api::TasksController

      before do
        User.current = User.where(:login => 'apiadmin').first
        @request.env['HTTP_ACCEPT'] = 'application/json'
        @request.env['CONTENT_TYPE'] = 'application/json'
      end

      describe 'GET /api/tasks/show' do
        it 'searches for task' do
          task = FactoryGirl.create(:dynflow_task, :user_create_task)
          get(:show, :id => task.id)
          assert_response :success
          assert_template 'api/tasks/show'
        end
      end

      describe 'POST /tasks/callback' do
        self.use_transactional_fixtures = false

        it 'passes the data to the corresponding action' do
          Support::DummyProxyAction.reset

          triggered = ForemanTasks.trigger(Support::DummyProxyAction, Support::DummyProxyAction.proxy, 'foo' => 'bar')
          Support::DummyProxyAction.proxy.task_triggered.wait(5)

          task = ForemanTasks::Task.where(:external_id => triggered.id).first
          task.state.must_equal 'running'
          task.result.must_equal 'pending'

          callback = Support::DummyProxyAction.proxy.log[:trigger_task].first[1][:callback]
          post(:callback, 'callback' => callback, 'data' => {'result' => 'success'})
          triggered.finished.wait(5)

          task.reload
          task.state.must_equal 'stopped'
          task.result.must_equal 'success'
          task.main_action.output['proxy_task_id'].must_equal "123"
          task.main_action.output['proxy_output'].must_equal({ 'result' => 'success' })
        end
      end
    end
  end
end


