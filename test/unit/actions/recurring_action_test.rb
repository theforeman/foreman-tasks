require 'foreman_tasks_test_helper'

module ForemanTasks
  class RecurringActionTest < ActiveSupport::TestCase
    class HookedAction < Actions::EntryAction
      include Actions::RecurringAction

      def plan(should_fail, _numbers)
        plan_self(:should_fail => should_fail)
      end

      def run
        raise "A controlled failure" if input[:should_fail]
      end
    end

    describe Actions::RecurringAction do
      include ::Dynflow::Testing

      let(:preset) do
        {
          :minutes => 0,
          :hours => 12,
          :days => 1,
          :months => ((Time.zone.now.month + 1) % 12) + 1
        }
      end

      let(:recurring_logic) do
        cronline = ForemanTasks::RecurringLogic.assemble_cronline(preset)
        logic = ForemanTasks::RecurringLogic.new_from_cronline(cronline)
        logic.state = 'active'
        logic.save!
        logic
      end

      let(:args) { [false, [1, 2, 3]] }

      let(:recurring_task) do
        recurring_logic.start(HookedAction, *args)
        recurring_logic.tasks.first
      end

      specify 'it triggers the repeat when task is cancelled' do
        recurring_task.must_be :delayed?
        recurring_logic.tasks.count.must_equal 1
        cancelled_events = recurring_task.execution_plan.cancel
        cancelled_events.each(&:wait!)
        recurring_logic.reload
        recurring_logic.tasks.count.must_equal 2
        new_task = recurring_logic.tasks.find { |task| task.id != recurring_task.id }
        new_task.execution_plan.delay_record.args.must_equal args
        new_task.start_at.must_equal(recurring_task.start_at + 1.year)
      end

      specify 'it triggers the repeat when the task goes into planned state' do
        delay_options = recurring_logic.generate_delay_options
        task = ForemanTasks.delay HookedAction, delay_options, args
        recurring_logic.tasks.count.must_equal 1

        # Perform planning of the delayed plan
        task.execution_plan.delay_record.plan

        # Check a repetition was planned
        recurring_logic.tasks.count.must_equal 2
      end

      specify 'it does not trigger repeat when failing in run' do
        delay_options = recurring_logic.generate_delay_options
        task = ForemanTasks.delay HookedAction, delay_options, true, args.last
        recurring_logic.tasks.count.must_equal 1

        # Perform the planning (trigger repeat)
        task.execution_plan.delay_record.plan
        recurring_logic.tasks.count.must_equal 2

        # Let it fail
        task.execution_plan.delay_record.execute.finished.wait
        task.reload
        task.result.must_equal 'error'

        # Check no new repetitions were planned
        recurring_logic.tasks.count.must_equal 2
      end

      specify 'it resets the request id on repetition' do
        begin
          expected_id = 'an_id'
          old_id = ::Logging.mdc['request']
          ::Logging.mdc['request'] = expected_id

          delay_options = recurring_logic.generate_delay_options
          task = ForemanTasks.delay HookedAction, delay_options, true, args.last
          task.input[:current_request_id].must_equal expected_id

          # Perform the planning (trigger repeat)
          task.execution_plan.delay_record.plan
          repetition = recurring_logic.tasks.find { |t| t.id != task.id }
          repetition.input[:current_request_id].must_be :nil?
        ensure
          ::Logging.mdc['request'] = old_id
        end
      end
    end
  end
end
