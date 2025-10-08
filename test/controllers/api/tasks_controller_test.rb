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

      describe 'GET /api/tasks' do
        before { FactoryBot.create_list(:dynflow_task, 5, :user_create_task) }
        it 'lists all tasks with default sorting' do
          get :index
          assert_response :success
          data = JSON.parse(response.body)
          assert_equal 5, data['results'].count
        end

        it 'supports searching' do
          get :index, params: { :search => 'label = Actions::User::Create' }
          assert_response :success
          data = JSON.parse(response.body)
          assert_equal 5, data['results'].count
        end

        it 'renders task ids when searching by resource id' do
          task = FactoryBot.create(:dynflow_task, :product_create_task)
          ForemanTasks::Link.create!(resource_type: "Katello::Product", resource_id: 1, task_id: task.id)
          get :index, params: { :search => "label = Actions::Katello::Product::Create and resource_id = 1" }
          assert_response :success
          data = JSON.parse(response.body)
          assert_equal task.id, data['results'].first["id"]
        end

        it 'supports ordering by duration' do
          get :index, params: { :order => 'duration' }
          assert_response :success
          data = JSON.parse(response.body)
          assert_equal 'duration', data.dig('sort', 'by')
          assert_equal 5, data['results'].count
        end

        context 'with current taxonomies' do
          it 'includes untaxed tasks and taxed by current taxonomy' do
            org1 = FactoryBot.create(:organization)
            org2 = FactoryBot.create(:organization)
            org1_task = FactoryBot.create(:task_with_links, resource_id: org1.id, resource_type: 'Organization')
            org2_task = FactoryBot.create(:task_with_links, resource_id: org2.id, resource_type: 'Organization')
            get :index, params: { organization_id: org1.id }
            assert_response :success
            results = JSON.parse(response.body)['results']
            assert_equal 6, results.count
            assert_includes results.map { |r| r['id'] }, org1_task.id
            assert_not_includes results.map { |r| r['id'] }, org2_task.id
          end
        end
      end

      describe 'POST /api/tasks/bulk_search' do
        it 'searching for a task' do
          task = FactoryBot.create(:dynflow_task, :user_create_task)
          post :bulk_search, params: { :searches => [{ :type => "task", :task_id => task.id, :search_id => "1" }] }
          assert_response :success
          data = JSON.parse(response.body)
          assert_equal task.id, data[0]['results'][0]['id']
        end

        it 'can search for a specific resource' do
          org = FactoryBot.create(:organization)
          task = FactoryBot.create(:task_with_links, resource_id: org.id, resource_type: 'Organization')

          post :bulk_search, params: { :searches => [{ :type => 'resource', :resource_id => org.id, :resource_type => 'Organization' }] }

          assert_response :success
          data = JSON.parse(response.body)
          assert_equal task.id, data[0]['results'][0]['id']
        end
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

        it 'does not show task the user is not allowed to see' do
          setup_user('view', 'foreman_tasks', 'owner.id = current_user')
          get :show, params: { id: FactoryBot.create(:some_task).id },
                     session: set_session_user(User.current)
          assert_response :not_found
        end

        it 'shows duration column' do
          task = ForemanTasks::Task.select_duration.find(FactoryBot.create(:dynflow_task).id)
          get :show, params: { id: task.id }, session: set_session_user
          assert_response :success
          data = JSON.parse(response.body)
          assert_equal task.duration.in_seconds.to_s, data['duration']
        end
      end

      describe 'GET /api/tasks/index' do
        it 'shows duration column' do
          task = ForemanTasks::Task.select_duration.find(FactoryBot.create(:dynflow_task).id)
          get :index, session: set_session_user
          assert_response :success
          data = JSON.parse(response.body)
          assert_equal task.duration.in_seconds.to_s, data['results'][0]['duration']
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

          def self.while_suspended
            triggered = ForemanTasks.trigger(DummyTestSummaryAction, true)
            wait_for { ForemanTasks::Task.find_by(external_id: triggered.id).state == 'running' }
            wait_for do
              w = ForemanTasks.dynflow.world
              w.persistence.load_step(triggered.id, 2, w).state == :suspended
            end
            yield
            ForemanTasks.dynflow.world.event(triggered.id, 2, nil)
            triggered.finished.wait
          end
        end

        test_attributes :pid => 'bdcab413-a25d-4fe1-9db4-b50b5c31ebce'
        it 'get tasks summary' do
          DummyTestSummaryAction.while_suspended do
            get :summary
            assert_response :success
            response = JSON.parse(@response.body)
            assert_kind_of Array, response
            assert_not response.empty?
            assert_kind_of Hash, response[0]
          end
        end

        it 'gets tasks summary only for tasks the user is allowed to see' do
          DummyTestSummaryAction.while_suspended do
            setup_user('view', 'foreman_tasks', 'owner.id = current_user')
            get :summary
            assert_response :success
            response = JSON.parse(@response.body)
            assert_kind_of Array, response
            assert_empty response
          end
        end
      end

      describe 'POST /tasks/callback' do
        it 'passes the data to the corresponding action' do
          Support::DummyProxyAction.reset
          ForemanTasks::RemoteTask.any_instance
                                  .expects(:proxy)
                                  .returns(Support::DummyProxyAction.proxy)

          triggered = ForemanTasks.trigger(Support::DummyProxyAction,
                                           Support::DummyProxyAction.proxy,
                                           'Proxy::DummyAction',
                                           'foo' => 'bar')
          Support::DummyProxyAction.proxy.task_triggered.wait(5)
          wait_for { ForemanTasks::Task.find_by(external_id: triggered.id).state == 'running' }

          task = ForemanTasks::Task.where(:external_id => triggered.id).first
          assert_equal 'running', task.state
          assert_equal 'pending', task.result

          callback = Support::DummyProxyAction.proxy.log[:trigger_task].first[1].first[1][:action_input][:callback]
          post :callback, params: { 'callback' => callback, 'data' => { 'result' => 'success' } }
          triggered.finished.wait(5)

          task.reload
          assert_equal 'stopped', task.state
          assert_equal 'success', task.result
          assert_equal({ 'result' => 'success' }, task.main_action.output['proxy_output'])
        end
      end

      describe 'POST /api/tasks/bulk_stop' do
        it 'requires search or task_ids parameter' do
          post :bulk_stop
          assert_response :bad_request
          data = JSON.parse(response.body)
          assert_includes data['error']['message'], 'Please provide at least one of search or task_ids parameters'
        end

        it 'stops tasks by task_ids and calls halt' do
          task1 = FactoryBot.create(:task_with_locks, :user_create_task, state: 'running')
          task2 = FactoryBot.create(:dynflow_task, :user_create_task, state: 'pending')
          task3 = FactoryBot.create(:dynflow_task, :user_create_task, state: 'stopped')
          post :bulk_stop, params: { task_ids: [task1.id, task2.id, task3.id] }
          assert_response :success
          data = JSON.parse(response.body)
          assert_equal 3, data['total']
          assert_equal 2, data['stopped_length']
          assert_equal 1, data['skipped_length']
          wait_for { task1.reload.state == 'stopped' }
          wait_for { task2.reload.state == 'stopped' }
          assert_predicate task1.locks, :empty?
        end

        it 'stops tasks by search query' do
          task1 = FactoryBot.create(:task_with_locks, :user_create_task, state: 'running')
          task2 = FactoryBot.create(:dynflow_task, :user_create_task, state: 'pending')

          UINotifications::Tasks::TaskBulkStop.any_instance.expects(:deliver!)

          post :bulk_stop, params: { search: 'label = Actions::User::Create' }
          assert_response :success
          data = JSON.parse(response.body)
          assert_equal 2, data['total']
          assert_equal 2, data['stopped_length']
          assert_equal 0, data['skipped_length']
          wait_for { task1.reload.state == 'stopped' }
          wait_for { task2.reload.state == 'stopped' }
          assert_predicate task1.locks, :empty?
        end
      end
    end
  end
end
