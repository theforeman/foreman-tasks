require "foreman_tasks_test_helper"

module ForemanTasks
  class ProxyActionTest <  ActiveSupport::TestCase

    describe Actions::ProxyAction do
      include ::Dynflow::Testing

      before do
        Support::DummyProxyAction.reset
        @action = create_and_plan_action(Support::DummyProxyAction, Support::DummyProxyAction.proxy, 'foo' => 'bar')
        @action = run_action(@action)
      end

      describe 'first run' do
        it 'triggers the corresponding action on the proxy' do
          proxy_call = Support::DummyProxyAction.proxy.log[:trigger_task].first
          proxy_call.must_equal(["Proxy::DummyAction",
                                 { "foo" => "bar",
                                   "proxy_url" => "proxy.example.com",
                                   "callback" => { "task_id" => "123", "step_id" => @action.run_step_id }}])
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
          Support::DummyProxyAction.proxy.log[:cancel_task].first.must_equal ['123']
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
        action.output[:proxy_output].must_equal({'result' => 'success'})
      end
    end

  end
end
