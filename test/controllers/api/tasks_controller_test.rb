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
          _(data['results'].count).must_equal 5
        end

        it 'supports searching' do
          get :index, params: { :search => 'label = Actions::User::Create' }
          assert_response :success
          data = JSON.parse(response.body)
          _(data['results'].count).must_equal 5
        end

        it 'renders task ids when searching by resource id' do
          task = FactoryBot.create(:dynflow_task, :product_create_task)
          ForemanTasks::Link.create!(resource_type: "Katello::Product", resource_id: 1, task_id: task.id)
          get :index, params: { :search => "label = Actions::Katello::Product::Create and resource_id = 1" }
          assert_response :success
          data = JSON.parse(response.body)
          _(data['results'].first["id"]).must_equal task.id
        end

        it 'supports ordering by duration' do
          get :index, params: { :sort_by => 'duration' }
          assert_response :success
          data = JSON.parse(response.body)
          _(data.dig('sort', 'by')).must_equal 'duration'
          _(data['results'].count).must_equal 5
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
            _(results.count).must_equal 6
            _(results.map { |r| r['id'] }).must_include org1_task.id
            _(results.map { |r| r['id'] }).wont_include org2_task.id
          end
        end
      end

      describe 'POST /api/tasks/bulk_search' do
        it 'searching for a task' do
          task = FactoryBot.create(:dynflow_task, :user_create_task)
          post :bulk_search, params: { :searches => [{ :type => "task", :task_id => task.id, :search_id => "1" }] }
          assert_response :success
          data = JSON.parse(response.body)
          _(data[0]['results'][0]['id']).must_equal task.id
        end

        it 'can search for a specific resource' do
          org = FactoryBot.create(:organization)
          task = FactoryBot.create(:task_with_links, resource_id: org.id, resource_type: 'Organization')

          post :bulk_search, params: { :searches => [{ :type => 'resource', :resource_id => org.id, :resource_type => 'Organization' }] }

          assert_response :success
          data = JSON.parse(response.body)
          _(data[0]['results'][0]['id']).must_equal task.id
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
          task = ForemanTasks::Task.with_duration.find(FactoryBot.create(:dynflow_task).id)
          get :show, params: { id: task.id }, session: set_session_user
          assert_response :success
          data = JSON.parse(response.body)
          _(data['duration']).must_equal task.duration
        end
      end

      describe 'GET /api/tasks/index' do
        it 'shows duration column' do
          task = ForemanTasks::Task.with_duration.find(FactoryBot.create(:dynflow_task).id)
          get :index, session: set_session_user
          assert_response :success
          data = JSON.parse(response.body)
          _(data['results'][0]['duration']).must_equal task.duration
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
          _(task.state).must_equal 'running'
          _(task.result).must_equal 'pending'

          callback = Support::DummyProxyAction.proxy.log[:trigger_task].first[1].first[1][:action_input][:callback]
          post :callback, params: { 'callback' => callback, 'data' => { 'result' => 'success' } }
          triggered.finished.wait(5)

          task.reload
          _(task.state).must_equal 'stopped'
          _(task.result).must_equal 'success'
          _(task.main_action.output['proxy_output']).must_equal('result' => 'success')
        end
      end
    end
  end
end
