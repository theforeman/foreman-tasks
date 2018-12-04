require 'foreman_tasks_test_helper'

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
          task = FactoryBot.create(:dynflow_task, :user_create_task)
          get :show, params: { :id => task.id }
          assert_response :success
          assert_template 'api/tasks/show'
        end

        test_attributes :pid => 'a2a81ca2-63c4-47f5-9314-5852f5e2617f'
        it 'search for non-existent task' do
          get :show, params: { :id => 'abc123' }
          assert_response :missing
          assert_includes @response.body, 'Resource task not found by id'
        end
      end

      describe 'GET /api/tasks/summary' do
        class DummyTestSummaryAction < Support::DummyDynflowAction
          # a dummy test action that do nothing
          def plan(suspend = false)
            plan_self :suspend => suspend
          end

          def run
            # a dummy run method
            if input[:suspend] && output[:suspended].nil?
              output[:suspended] = true
              suspend
            end
          end
        end

        test_attributes :pid => 'bdcab413-a25d-4fe1-9db4-b50b5c31ebce'
        it 'get tasks summary' do
          triggered = ForemanTasks.trigger(DummyTestSummaryAction, true)
          wait_for { ForemanTasks::Task.find_by(external_id: triggered.id).state == 'running' }
          wait_for do
            w = ForemanTasks.dynflow.world
            w.persistence.load_step(triggered.id, 2, w).state == :suspended
          end
          get :summary
          assert_response :success
          response = JSON.parse(@response.body)
          assert_kind_of Array, response
          assert_not response.empty?
          assert_kind_of Hash, response[0]
          ForemanTasks.dynflow.world.event(triggered.id, 2, nil)
          triggered.finished.wait
        end
      end

      describe 'POST /tasks/callback' do
        it 'passes the data to the corresponding action' do
          Support::DummyProxyAction.reset

          triggered = ForemanTasks.trigger(Support::DummyProxyAction,
                                           Support::DummyProxyAction.proxy,
                                           'Proxy::DummyAction',
                                           'foo' => 'bar')
          Support::DummyProxyAction.proxy.task_triggered.wait(5)
          wait_for { ForemanTasks::Task.find_by(external_id: triggered.id).state == 'running' }

          task = ForemanTasks::Task.where(:external_id => triggered.id).first
          task.state.must_equal 'running'
          task.result.must_equal 'pending'

          callback = Support::DummyProxyAction.proxy.log[:trigger_task].first[1][:callback]
          post :callback, params: { 'callback' => callback, 'data' => { 'result' => 'success' } }
          triggered.finished.wait(5)

          task.reload
          task.state.must_equal 'stopped'
          task.result.must_equal 'success'
          task.main_action.output['proxy_task_id'].must_equal Support::DummyProxyAction.proxy.uuid
          task.main_action.output['proxy_output'].must_equal('result' => 'success')
        end
      end
    end
  end
end
