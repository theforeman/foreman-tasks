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
          acc.merge(cur.execution_plan_id.to_s => { 'task_id' => cur.id + 5, 'result' => 'success' })
        end

        fake_proxy = mock
        fake_proxy.expects(:launch_tasks).returns(results)
        remote_tasks.first.expects(:proxy).returns(fake_proxy)
        RemoteTask.batch_trigger('a_operation', remote_tasks)
        remote_tasks.each do |remote_task|
          remote_task.reload
          assert_equal 'triggered', remote_task.state
          assert_equal (remote_task.id + 5).to_s, remote_task.remote_task_id
        end
      end

      it 'honors the batches with multiple proxies' do
        remote_task = remote_tasks.last
        remote_task.proxy_url = 'something else'

        results = remote_tasks.reduce({}) do |acc, cur|
          acc.merge(cur.execution_plan_id.to_s => { 'task_id' => cur.id + 5, 'result' => 'success' })
        end
        other_results = { remote_task.execution_plan_id => results.delete(remote_task.execution_plan_id) }

        fake_proxy = mock
        fake_proxy.expects(:launch_tasks).returns(results)

        another_fake_proxy = mock
        another_fake_proxy.expects(:launch_tasks).returns(other_results)

        remote_tasks.first.expects(:proxy).returns(fake_proxy)
        remote_tasks.last.expects(:proxy).returns(another_fake_proxy)

        RemoteTask.batch_trigger('a_operation', remote_tasks)
        remote_tasks.each do |remote_task|
          remote_task.reload
          assert_equal 'triggered', remote_task.state
          assert_equal (remote_task.id + 5).to_s, remote_task.remote_task_id
        end
      end
    end
  end
end
