require 'foreman_tasks_core_test_helper'
require 'foreman_tasks/test_helpers'
require 'foreman_tasks_core/runner'
require 'ostruct'

module ForemanTasksCore
  module Runner
    class RunnerTest < ActiveSupport::TestCase
      include ForemanTasks::TestHelpers::WithInThreadExecutor

      describe Base do
        let(:suspended_action) { Class.new }
        let(:runner) { Base.new suspended_action: suspended_action }

        describe '#generate_updates' do
          it 'returns empty hash when there are no outputs' do
            _(runner.generate_updates).must_be :empty?
          end

          it 'returns a hash with outputs' do
            message = 'a message'
            type = 'stdout'
            runner.publish_data(message, type)
            updates = runner.generate_updates
            _(updates.keys).must_equal [suspended_action]
            update = updates.values.first
            _(update.exit_status).must_be :nil?
            _(update.continuous_output.raw_outputs.count).must_equal 1
          end

          it 'works in compatibility mode' do
            runner = Base.new
            message = 'a message'
            type = 'stdout'
            runner.publish_data(message, type)
            updates = runner.generate_updates
            _(updates.keys).must_equal [nil]
            update = updates.values.first
            _(update.exit_status).must_be :nil?
            _(update.continuous_output.raw_outputs.count).must_equal 1
          end
        end
      end

      describe Parent do
        let(:suspended_action) { ::Dynflow::Action::Suspended.allocate }
        let(:runner) { Parent.new targets, suspended_action: suspended_action }
        let(:targets) do
          { 'foo' => { 'execution_plan_id' => '123', 'run_step_id' => 2 },
            'bar' => { 'execution_plan_id' => '456', 'run_step_id' => 2 } }
        end

        describe '#initialize_continuous_outputs' do
          it 'initializes outputs for targets and parent' do
            outputs = runner.initialize_continuous_outputs
            _(outputs.keys.count).must_equal 2
            outputs.values.each { |output| _(output).must_be_instance_of ContinuousOutput }
          end
        end

        describe '#generate_updates' do
          it 'returns only updates for hosts with pending outputs' do
            _(runner.generate_updates).must_equal({})
            runner.publish_data_for('foo', 'something', 'something')
            updates = runner.generate_updates
            _(updates.keys.count).must_equal 1
          end

          it 'works without compatibility mode' do
            runner.broadcast_data('something', 'stdout')
            updates = runner.generate_updates
            _(updates.keys.count).must_equal 2
            updates.keys.each do |key|
              _(key).must_be_instance_of ::Dynflow::Action::Suspended
            end
          end
        end

        describe '#publish_data_for' do
          it 'publishes data for a single host' do
            runner.publish_data_for('foo', 'message', 'stdout')
            _(runner.generate_updates.keys.count).must_equal 1
          end
        end

        describe '#broadcast_data' do
          it 'publishes data for all hosts' do
            runner.broadcast_data('message', 'stdout')
            _(runner.generate_updates.keys.count).must_equal 2
          end
        end

        describe '#publish_exception' do
          let(:exception) do
            exception = RuntimeError.new
            exception.stubs(:backtrace).returns([])
            exception
          end

          before { runner.logger.stubs(:error) }

          it 'broadcasts the exception to all targets' do
            runner.expects(:publish_exit_status).never
            runner.publish_exception('general failure', exception, false)
            _(runner.generate_updates.keys.count).must_equal 2
          end

          it 'publishes exit status if fatal' do
            runner.expects(:publish_exit_status)
            runner.publish_exception('general failure', exception, true)
          end
        end
      end
    end
  end
end
