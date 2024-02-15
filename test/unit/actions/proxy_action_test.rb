require 'foreman_tasks_test_helper'
require 'ostruct'

module ForemanTasks
  class ProxyActionTest <  ActiveSupport::TestCase
    describe Actions::ProxyAction do
      include ::Dynflow::Testing

      let(:secrets) do
        { 'logins' => { 'admin' => 'changeme', 'root' => 'toor' } }
      end
      let(:batch_triggering) { false }

      before do
        Support::DummyProxyAction.reset
        RemoteTask.any_instance.stubs(:proxy).returns(Support::DummyProxyAction.proxy)
        Setting.stubs(:[]).with('foreman_tasks_proxy_action_retry_interval')
        Setting.stubs(:[]).with('foreman_tasks_proxy_action_retry_count')
        Setting.stubs(:[]).with('foreman_tasks_proxy_batch_trigger').returns(batch_triggering)
        @action = create_and_plan_action(Support::DummyProxyAction,
                                         Support::DummyProxyAction.proxy,
                                         'Proxy::DummyAction',
                                         'foo' => 'bar',
                                         'secrets' => secrets,
                                         'use_batch_triggering' => batch_triggering)
        RemoteTask.any_instance.stubs(:action).returns(@action)
        RemoteTask.any_instance.stubs(:task).returns(OpenStruct.new(:id => Support::DummyProxyAction.proxy.uuid))
        @run_step_id = @action.run_step_id

        @action = run_action(@action)
      end

      describe 'first run' do
        it 'triggers the corresponding action on the proxy' do
          proxy_call = Support::DummyProxyAction.proxy.log[:trigger_task].first
          action_input =
            { :action_class => 'Proxy::DummyAction',
              :action_input =>
                { 'foo' => 'bar',
                  'secrets' => secrets,
                  'connection_options' =>
                    { 'retry_interval' => 15, 'retry_count' => 4,
                      'proxy_batch_triggering' => batch_triggering },
                  'use_batch_triggering' => batch_triggering,
                  'proxy_url' => 'proxy.example.com',
                  'proxy_action_name' => 'Proxy::DummyAction',
                  'callback' => { 'task_id' => Support::DummyProxyAction.proxy.uuid, 'step_id' => @run_step_id } } }
          expected_call = ['support', { @action.execution_plan_id => action_input }]
          assert_equal expected_call, proxy_call
        end

        describe 'with batch triggering' do
          let(:batch_triggering) { true }
          it 'create remote tasks for batch triggering' do
            task = RemoteTask.first
            assert_equal 'new', task.state
            assert_equal @action.execution_plan_id, task.execution_plan_id
            assert_equal 'support', task.operation
            assert_nil task.remote_task_id
          end
        end
      end

      describe 'resumed run' do
        it "doesn't trigger the corresponding action again on the proxy" do
          action = run_action(@action)

          assert_equal :suspended, action.state

          assert_equal 1, Support::DummyProxyAction.proxy.log[:trigger_task].size
        end
      end

      it 'supports skipping' do
        action = run_action(@action, ::Dynflow::Action::Skip)
        assert_equal :success, action.state
      end

      describe 'cancel' do
        it 'sends the cancel event to the proxy when the cancel event is sent for the first time' do
          action = run_action(@action, ::Dynflow::Action::Cancellable::Cancel)
          assert_equal [action.execution_plan_id], Support::DummyProxyAction.proxy.log[:cancel_task].first
          assert_equal :suspended, action.state
        end

        it 'cancels the action immediatelly when cancel event is sent for the second time' do
          action = run_action(@action, ::Dynflow::Action::Cancellable::Cancel)
          error = begin
                    run_action(action, ::Dynflow::Action::Cancellable::Cancel)
                  rescue => e
                    e
                  end

          assert_equal 1, Support::DummyProxyAction.proxy.log[:cancel_task].size
          assert_match 'Cancel enforced', error.message
        end
      end

      it 'saves the data comming from the proxy to the output and finishes' do
        action = run_action(@action, ::Actions::ProxyAction::CallbackData.new('result' => 'success'))
        assert_equal({'result' => 'success'}, action.output[:proxy_output])
      end

      it 'handles connection errors' do
        action = create_and_plan_action(Support::DummyProxyAction,
                                        Support::DummyProxyAction.proxy,
                                        'Proxy::DummyAction',
                                        :foo => 'bar')
        run_stubbed_action = lambda do |lambda_action|
          run_action lambda_action do |block_action|
            block_action.expects(:trigger_proxy_task).raises(Errno::ECONNREFUSED.new('Connection refused'))
          end
        end
        action = run_stubbed_action.call action
        assert_equal :suspended, action.state
        assert_equal 1, action.world.clock.pending_pings.length
        assert_equal 1, action.output[:metadata][:failed_proxy_tasks].length
        2.times { action.output[:metadata][:failed_proxy_tasks] << {} }
        assert_raises(Errno::ECONNREFUSED) { run_stubbed_action.call action }
        assert_equal :error, action.state
      end

      it 'hides secrets' do
        triggered = ForemanTasks.dynflow.world.trigger(Support::DummyProxyAction,
                                                       Support::DummyProxyAction.proxy,
                                                       'Proxy::DummyAction',
                                                       'foo' => 'bar',
                                                       'secrets' => secrets)
        task = ForemanTasks::Task.where(:external_id => triggered.id).first
        assert_equal 'Secrets hidden', task.input[:secrets]
        triggered.future.wait # Wait for the task to get triggered before leaving the test
      end

      it 'wipes secrets' do
        assert_equal secrets, @action.input[:secrets]
        action = run_action(@action, ::Actions::ProxyAction::CallbackData.new('result' => 'success'))

        # #wipe_secrets! gets called as a hook, hooks are not triggered when using action testing helpers
        persistence = mock
        persistence.stubs(:save_action)
        action.world.stubs(:persistence).returns(persistence)
        action.wipe_secrets!(nil)

        refute action.input.key?(:secrets)
      end
    end
  end
end
