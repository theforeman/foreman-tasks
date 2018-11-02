require 'foreman_tasks_test_helper'

module ForemanTasks
  class RemoteTaskTest < ActiveSupport::TestCase
    describe 'batch triggering' do
      let(:remote_tasks) do
        (1..5).map do |i|
          task = RemoteTask.new :execution_plan_id => i, :step_id => 1, :proxy_url => "something"
          task.expects(:proxy_input).returns({})
          task.expects(:proxy_action_name).returns('MyProxyAction')
          task.save!
          task
        end
      end

      it 'triggers in batches' do
        results = remote_tasks.reduce({}) do |acc, cur|
          acc.merge(cur.id.to_s => { 'task_id' => cur.id + 5, 'result' => 'success' })
        end

        fake_proxy = mock()
        fake_proxy.expects(:launch_tasks).returns(results)
        remote_tasks.first.expects(:proxy).returns(fake_proxy)
        RemoteTask.batch_trigger('a_feature', remote_tasks)
        remote_tasks.each do |remote_task|
          remote_task.reload
          remote_task.state.must_equal 'triggered'
          remote_task.remote_task_id.must_equal (remote_task.id + 5).to_s
        end
      end

      it 'fallbacks to old way when batch trigger gets 404' do
        fake_proxy = mock()
        fake_proxy.expects(:launch_tasks).raises(RestClient::NotFound.new)
        remote_tasks.first.expects(:proxy).returns(fake_proxy)
        remote_tasks.each { |task| task.expects(:trigger) }
        RemoteTask.batch_trigger('a_feature', remote_tasks)
      end
    end
  end
end
