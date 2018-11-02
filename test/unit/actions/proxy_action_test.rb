require 'foreman_tasks_test_helper'

module ForemanTasks
  class ProxyActionTest <  ActiveSupport::TestCase
    describe Actions::ProxyAction do
      include ::Dynflow::Testing

      let(:secrets) do
        { 'logins' => { 'admin' => 'changeme', 'root' => 'toor' } }
      end
      let(:batch_triggering) { false }

      before do
        Support::DummyProxyAction.any_instance.stubs(:with_batch_triggering?).returns(batch_triggering)
        Support::DummyProxyAction.reset
        RemoteTask.any_instance.stubs(:proxy).returns(Support::DummyProxyAction.proxy)
        @action = create_and_plan_action(Support::DummyProxyAction,
                                         Support::DummyProxyAction.proxy,
                                         'Proxy::DummyAction',
                                         'foo' => 'bar',
                                         'secrets' => secrets)
        @action = run_action(@action)
      end

      describe 'first run' do
        it 'triggers the corresponding action on the proxy' do
          proxy_call = Support::DummyProxyAction.proxy.log[:trigger_task].first
          expected_call = ['Proxy::DummyAction',
                           { 'foo' => 'bar',
                             'secrets' => secrets,
                             'connection_options' =>
                               { 'retry_interval' => 15, 'retry_count' => 4,
                                 'proxy_batch_triggering' => false },
                             'proxy_url' => 'proxy.example.com',
                             'proxy_action_name' => 'Proxy::DummyAction',
                             'callback' => { 'task_id' => Support::DummyProxyAction.proxy.uuid, 'step_id' => @action.run_step_id } }]
          proxy_call.must_equal(expected_call)
        end

        describe 'with batch triggering' do
          let(:batch_triggering) { true }
          it 'create remote tasks for batch triggering' do
            task = RemoteTask.first
            task.state.must_equal 'new'
            task.execution_plan_id.must_equal @action.execution_plan_id
            task.feature.must_equal 'support'
            task.remote_task_id.must_be :nil?
          end
        end
      end

      describe 'resumed run' do
        it "doesn't trigger the corresponding action again on the proxy" do
          action = run_action(@action)

          action.state.must_equal :suspended

          Support::DummyProxyAction.proxy.log[:trigger_task].size.must_equal 1
        end
      end

      it 'supports skipping' do
        action = run_action(@action, ::Dynflow::Action::Skip)
        action.state.must_equal :success
      end

      describe 'cancel' do
        it 'sends the cancel event to the proxy when the cancel event is sent for the first time' do
          action = run_action(@action, ::Dynflow::Action::Cancellable::Cancel)
          Support::DummyProxyAction.proxy.log[:cancel_task].first.must_equal [Support::DummyProxyAction.proxy.uuid]
          action.state.must_equal :suspended
        end

        it 'cancels the action immediatelly when cancel event is sent for the second time' do
          action = run_action(@action, ::Dynflow::Action::Cancellable::Cancel)
          error = begin
                    run_action(action, ::Dynflow::Action::Cancellable::Cancel)
                  rescue => e
                    e
                  end

          Support::DummyProxyAction.proxy.log[:cancel_task].size.must_equal 1
          error.message.must_match 'Cancel enforced'
        end
      end

      it 'saves the data comming from the proxy to the output and finishes' do
        action = run_action(@action, ::Actions::ProxyAction::CallbackData.new('result' => 'success'))
        action.output[:proxy_output].must_equal('result' => 'success')
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
        action.state.must_equal :suspended
        action.world.clock.pending_pings.length.must_equal 1
        action.output[:metadata][:failed_proxy_tasks].length.must_equal 1
        2.times { action.output[:metadata][:failed_proxy_tasks] << {} }
        proc { action = run_stubbed_action.call action }.must_raise(Errno::ECONNREFUSED)
        action.state.must_equal :error
      end

      it 'hides secrets' do
        triggered = ForemanTasks.dynflow.world.trigger(Support::DummyProxyAction,
                                                       Support::DummyProxyAction.proxy,
                                                       'Proxy::DummyAction',
                                                       'foo' => 'bar',
                                                       'secrets' => secrets)
        task = ForemanTasks::Task.where(:external_id => triggered.id).first
        task.input[:secrets].must_equal 'Secrets hidden'
        triggered.future.wait # Wait for the task to get triggered before leaving the test
      end

      it 'wipes secrets' do
        @action.input[:secrets].must_equal secrets
        action = run_action(@action, ::Actions::ProxyAction::CallbackData.new('result' => 'success'))

        # #wipe_secrets! gets called as a hook, hooks are not triggered when using action testing helpers
        persistence = mock
        persistence.stubs(:save_action)
        action.world.stubs(:persistence).returns(persistence)
        action.wipe_secrets!(nil)

        assert_not action.input.key?(:secrets)
      end
    end
  end
end
