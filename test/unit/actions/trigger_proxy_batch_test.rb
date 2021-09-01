require 'foreman_tasks_test_helper'

module ForemanTasks
  class TriggerProxyBatchTest < ActiveSupport::TestCase
    describe Actions::TriggerProxyBatch do
      include ::Dynflow::Testing

      let(:batch_size) { 20 }
      let(:total_count) { 100 }
      let(:action) { create_and_plan_action(Actions::TriggerProxyBatch, total_count: total_count, batch_size: batch_size) }
      let(:triggered) { run_action(action) }

      describe 'triggering' do
        it 'doesnt run anything on trigger' do
          Actions::TriggerProxyBatch.any_instance.expects(:trigger_remote_tasks_batch).never
          _(triggered.state).must_equal :suspended
          _(triggered.output[:planned_count]).must_equal 0
        end

        it 'triggers remote tasks on TriggerNextBatch' do
          Actions::TriggerProxyBatch.any_instance.expects(:trigger_remote_tasks_batch).once
          run_action(triggered, Actions::TriggerProxyBatch::TriggerNextBatch[1])
        end

        it 'triggers remote tasks on TriggerNextBatch defined number of times' do
          Actions::TriggerProxyBatch.any_instance.expects(:trigger_remote_tasks_batch).twice
          run_action(triggered, Actions::TriggerProxyBatch::TriggerNextBatch[2])
        end

        it 'triggers the last batch on resume' do
          Actions::TriggerProxyBatch.any_instance.expects(:trigger_remote_tasks_batch).once
          triggered.output[:planned_count] = ((total_count - 1) / batch_size) * batch_size
          run_action(triggered)
        end
      end

      describe '#trigger_remote_tasks_batch' do
        let(:proxy_operation_name) { 'ansible_runner' }
        let(:grouped_remote_batch) { Array.new(batch_size).map { |i| mock("RemoteTask#{i}") } }
        let(:remote_tasks) do
          m = mock('RemoteTaskARScope')
          m.stubs(pending: m, order: m)
          m.stubs(group_by: { proxy_operation_name => grouped_remote_batch })
          m
        end

        it 'fetches batch_size of tasks and triggers them' do
          remote_tasks.expects(:first).with(batch_size).returns(remote_tasks)
          triggered.expects(:remote_tasks).returns(remote_tasks)
          ForemanTasks::RemoteTask.expects(:batch_trigger).with(proxy_operation_name, grouped_remote_batch)

          triggered.trigger_remote_tasks_batch
          _(triggered.output[:planned_count]).must_equal(batch_size)
        end
      end
    end
  end
end
