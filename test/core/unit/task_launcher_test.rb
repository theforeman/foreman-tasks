require 'foreman_tasks_test_helper'
require 'foreman_tasks/test_helpers'

module ForemanTasksCore
  module TaskLauncher
    class TaskLauncherTest < ActiveSupport::TestCase
      include ForemanTasks::TestHelpers::WithInThreadExecutor

      describe ForemanTasksCore::TaskLauncher do
        let(:launcher) { launcher_class.new ForemanTasks.dynflow.world, {} }
        let(:launcher_input) { { 'action_class' => Support::DummyDynflowAction.to_s, 'action_input' => input } }
        let(:input) { { :do => :something } }
        let(:expected_result) { input.merge(:callback_host => {}) }
        let(:expected_batch_result) { expected_result.merge('callback' => nil) }

        describe ForemanTasksCore::TaskLauncher::Single do
          let(:launcher_class) { Single }

          it 'triggers an action' do
            Support::DummyDynflowAction.any_instance.expects(:plan).with do |arg|
              arg.must_equal(expected_result)
            end
            launcher.launch!(launcher_input)
          end

          it 'provides results' do
            plan = launcher.launch!(launcher_input).finished.value!
            launcher.results[:result].must_equal 'success'
            plan.result.must_equal :success
          end
        end

        describe ForemanTasksCore::TaskLauncher::Batch do
          let(:launcher_class) { Batch }

          it 'triggers the actions' do
            Support::DummyDynflowAction.any_instance.expects(:plan).with { |arg| arg == expected_batch_result }.twice
            parent = launcher.launch!('foo' => launcher_input, 'bar' => launcher_input)
            plan = parent.finished.value!
            plan.result.must_equal :success
            plan.sub_plans.count.must_equal 2
          end

          it 'provides results' do
            launcher.launch!('foo' => launcher_input, 'bar' => launcher_input)
            launcher.results.keys.must_equal %w[foo bar]
            launcher.results.values.each do |result|
              plan = ForemanTasks.dynflow.world.persistence.load_execution_plan(result[:task_id])
              result[:result].must_equal 'success'
              plan.result.must_equal :success
            end
          end
        end
      end
    end
  end
end
