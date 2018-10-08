require 'foreman_tasks_core_test_helper'
require 'foreman_tasks/test_helpers'
require 'foreman_tasks_core/runner'

module ForemanTasksCore
  module Runner
    describe Dispatcher::RunnerActor do
      include ForemanTasks::TestHelpers::WithInThreadExecutor

      let(:dispatcher) { Dispatcher.instance }
      let(:suspended_action) { mock }
      let(:runner) { mock.tap { |r| r.stubs(:id) } }
      let(:clock) { ForemanTasks.dynflow.world.clock }
      let(:logger) { mock.tap { |l| l.stubs(:debug) } }
      let(:actor) do
        Dispatcher::RunnerActor.new dispatcher, suspended_action, runner, clock, logger
      end

      it 'delivers all updates to actions' do
        targets = (0..2).map { mock }.each_with_index { |mock, index| mock.expects(:<<).with(index) }
        updates = targets.each_with_index.reduce({}) { |acc, (cur, index)| acc.merge(cur => index) }
        runner.expects(:run_refresh).returns(updates)
        actor.expects(:plan_next_refresh)
        actor.refresh_runner
      end

      it 'plans next refresh' do
        runner.expects(:run_refresh).returns({})
        actor.expects(:plan_next_refresh)
        actor.refresh_runner
      end

      it 'does not plan next resfresh if done' do
        update = Update.new(nil, 0)
        suspended_action.expects(:<<).with(update)
        runner.expects(:run_refresh).returns(suspended_action => update)
        dispatcher.expects(:finish)
        dispatcher.ticker.expects(:tell).never
        actor.refresh_runner
      end
    end
  end
end
