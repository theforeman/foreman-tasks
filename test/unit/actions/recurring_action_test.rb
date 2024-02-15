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
          :months => ((Time.zone.now.month + 1) % 12) + 1,
        }
      end

      let(:recurring_logic) do
        cronline = ForemanTasks::RecurringLogic.assemble_cronline(preset)
        logic = ForemanTasks::RecurringLogic.new_from_cronline(cronline)
        logic.state = 'active'
        logic.save!
        logic
      end

      let(:past_recurring_logic) do
        cronline = "* * * * *"
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
        assert_predicate recurring_task, :delayed?
        assert_equal 1, recurring_logic.tasks.count
        cancelled_events = recurring_task.execution_plan.cancel
        cancelled_events.each(&:wait!)
        recurring_logic.reload
        assert_equal 2, recurring_logic.tasks.count
        new_task = recurring_logic.tasks.find { |task| task.id != recurring_task.id }
        assert_equal args, new_task.execution_plan.delay_record.args
        assert_equal recurring_task.start_at + 1.year, new_task.start_at
      end

      specify 'it triggers the repeat when the task goes into planned state' do
        delay_options = recurring_logic.generate_delay_options
        task = ForemanTasks.delay HookedAction, delay_options, *args
        assert_equal 1, recurring_logic.tasks.count

        # Perform planning of the delayed plan
        task.execution_plan.delay_record.plan

        # Check a repetition was planned
        assert_equal 2, recurring_logic.tasks.count
      end

      specify 'it does not trigger repeat when failing in run' do
        delay_options = recurring_logic.generate_delay_options
        task = ForemanTasks.delay HookedAction, delay_options, true, args.last
        assert_equal 1, recurring_logic.tasks.count

        # Perform the planning (trigger repeat)
        task.execution_plan.delay_record.plan
        assert_equal 2, recurring_logic.tasks.count

        # Let it fail
        task.execution_plan.delay_record.execute.finished.wait
        task.reload
        assert_equal 'error', task.result

        # Check no new repetitions were planned
        assert_equal 2, recurring_logic.tasks.count
      end

      specify 'it resets the request id on repetition' do
        expected_id = 'an_id'
        new_id = SecureRandom.uuid
        old_id = ::Logging.mdc['request']
        ::Logging.mdc['request'] = expected_id

        delay_options = recurring_logic.generate_delay_options
        task = ForemanTasks.delay HookedAction, delay_options, true, args.last
        assert_equal expected_id, task.input[:current_request_id]

        SecureRandom.stubs(:uuid).returns(new_id)
        # Perform the planning (trigger repeat)
        task.execution_plan.delay_record.plan
        repetition = recurring_logic.tasks.find { |t| t.id != task.id }
        assert_equal new_id, repetition.input[:current_request_id]
      ensure
        ::Logging.mdc['request'] = old_id
      end

      specify 'it does not trigger tasks in the past' do
        delay_options = past_recurring_logic.generate_delay_options
        delay_options[:start_at] = Time.zone.now - 1.week
        task = ForemanTasks.delay HookedAction, delay_options, *args
        assert_equal 1, past_recurring_logic.tasks.count

        task.execution_plan.delay_record.plan
        # Post planning, a new task should be scheduled
        assert_equal 2, past_recurring_logic.tasks.count
        # The scheduled task should have the start date according to cron in future.
        assert_equal (Time.zone.now + 1.minute).change(:sec => 0), past_recurring_logic.tasks.where(:state => "scheduled").first.start_at
      end
    end
  end
end
