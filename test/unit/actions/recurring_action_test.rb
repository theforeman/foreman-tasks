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
        _(recurring_task).must_be :delayed?
        _(recurring_logic.tasks.count).must_equal 1
        cancelled_events = recurring_task.execution_plan.cancel
        cancelled_events.each(&:wait!)
        recurring_logic.reload
        _(recurring_logic.tasks.count).must_equal 2
        new_task = recurring_logic.tasks.find { |task| task.id != recurring_task.id }
        _(new_task.execution_plan.delay_record.args).must_equal args
        _(new_task.start_at).must_equal(recurring_task.start_at + 1.year)
      end

      specify 'it triggers the repeat when the task goes into planned state' do
        delay_options = recurring_logic.generate_delay_options
        task = ForemanTasks.delay HookedAction, delay_options, *args
        _(recurring_logic.tasks.count).must_equal 1

        # Perform planning of the delayed plan
        task.execution_plan.delay_record.plan

        # Check a repetition was planned
        _(recurring_logic.tasks.count).must_equal 2
      end

      specify 'it does not trigger repeat when failing in run' do
        delay_options = recurring_logic.generate_delay_options
        task = ForemanTasks.delay HookedAction, delay_options, true, args.last
        _(recurring_logic.tasks.count).must_equal 1

        # Perform the planning (trigger repeat)
        task.execution_plan.delay_record.plan
        _(recurring_logic.tasks.count).must_equal 2

        # Let it fail
        task.execution_plan.delay_record.execute.finished.wait
        task.reload
        _(task.result).must_equal 'error'

        # Check no new repetitions were planned
        _(recurring_logic.tasks.count).must_equal 2
      end

      specify 'it resets the request id on repetition' do
        begin
          expected_id = 'an_id'
          new_id = SecureRandom.uuid
          old_id = ::Logging.mdc['request']
          ::Logging.mdc['request'] = expected_id

          delay_options = recurring_logic.generate_delay_options
          task = ForemanTasks.delay HookedAction, delay_options, true, args.last
          _(task.input[:current_request_id]).must_equal expected_id

          SecureRandom.stubs(:uuid).returns(new_id)
          # Perform the planning (trigger repeat)
          task.execution_plan.delay_record.plan
          repetition = recurring_logic.tasks.find { |t| t.id != task.id }
          _(repetition.input[:current_request_id]).must_equal new_id
        ensure
          ::Logging.mdc['request'] = old_id
        end
      end

      specify 'it does not trigger tasks in the past' do
        delay_options = past_recurring_logic.generate_delay_options
        delay_options[:start_at] = Time.zone.now - 1.week
        task = ForemanTasks.delay HookedAction, delay_options, *args
        _(past_recurring_logic.tasks.count).must_equal 1

        task.execution_plan.delay_record.plan
        # Post planning, a new task should be scheduled
        _(past_recurring_logic.tasks.count).must_equal 2
        # The scheduled task should have the start date according to cron in future.
        assert_equal (Time.zone.now + 1.minute).change(:sec => 0), past_recurring_logic.tasks.where(:state => "scheduled").first.start_at
      end
    end
  end
end
