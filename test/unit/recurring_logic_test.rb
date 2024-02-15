require 'foreman_tasks_test_helper'

class RecurringLogicsTest < ActiveSupport::TestCase
  describe 'generating times' do
    it 'assembles cronline' do
      hash = {}
      assert_equal '* * * * *', ForemanTasks::RecurringLogic.assemble_cronline(hash)
      hash.update :minutes => '*'
      assert_equal '* * * * *', ForemanTasks::RecurringLogic.assemble_cronline(hash)
      hash.update :hours => '0,12'
      assert_equal '* 0,12 * * *', ForemanTasks::RecurringLogic.assemble_cronline(hash)
      hash.update :days => '*/2'
      assert_equal '* 0,12 */2 * *', ForemanTasks::RecurringLogic.assemble_cronline(hash)
      hash.update :months => '12'
      assert_equal '* 0,12 */2 12 *', ForemanTasks::RecurringLogic.assemble_cronline(hash)
      hash.update :days_of_week => '1,2,3,4,5,6,7'
      assert_equal '* 0,12 */2 12 1,2,3,4,5,6,7', ForemanTasks::RecurringLogic.assemble_cronline(hash)
    end

    it 'generates correct times' do
      year = 2015
      month = 9
      day = 29
      hour = 15
      minute = 0
      reference_time = Time.utc(year, month, day, hour, minute)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('* * * * *')
      assert_equal Time.utc(year, month, day, hour, minute), parser.next_occurrence_time(reference_time)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('*/2 * * * *')
      assert_equal Time.utc(year, month, day, hour, minute), parser.next_occurrence_time(reference_time)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('*/2 18,19 * * *')
      assert_equal Time.utc(year, month, day, 18), parser.next_occurrence_time(reference_time)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('*/2 18,19 10 * *')
      assert_equal Time.utc(year, month + 1, 10, 18, minute), parser.next_occurrence_time(reference_time)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('*/2 18,19 10 11,12 *')
      assert_equal Time.utc(year, 11, 10, 18, 0), parser.next_occurrence_time(reference_time)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('* * * * 1')
      assert_equal Time.utc(year, month + 1, 5), parser.next_occurrence_time(reference_time)
    end

    it 'creates correct cronline hash' do
      minutes = '52'
      hours = '12'
      days = '11'
      days_of_week = { '1' => '1', '2' => '0', '3' => '0', '4' => '1', '5' => '0', '6' => '1', '7' => '0' }
      time_hash = { '0' => '2015', '1' => '12', '2' => '10', '3' => hours, '4' => minutes }
      expected_result_hourly = { :minutes => minutes }
      expected_result_daily = { :minutes => minutes, :hours => hours }
      expected_result_weekly = { :minutes => minutes, :hours => hours, :days_of_week => '1,4,6' }
      expected_result_monthly = { :minutes => minutes, :hours => hours, :days => days }
      assert_equal expected_result_hourly, ForemanTasks::RecurringLogic.cronline_hash(:hourly, time_hash, days, days_of_week)
      assert_equal expected_result_daily, ForemanTasks::RecurringLogic.cronline_hash(:daily, time_hash, days, days_of_week)
      assert_equal expected_result_weekly, ForemanTasks::RecurringLogic.cronline_hash(:weekly, time_hash, days, days_of_week)
      assert_equal expected_result_monthly, ForemanTasks::RecurringLogic.cronline_hash(:monthly, time_hash, days, days_of_week)
    end

    it 'validates cronline correctly' do
      recurring_logic = ::ForemanTasks::RecurringLogic.new_from_cronline('* * * * abc')
      assert_not recurring_logic.valid_cronline?
      recurring_logic = ::ForemanTasks::RecurringLogic.new_from_cronline(nil)
      assert_not recurring_logic.valid_cronline?
      recurring_logic = ::ForemanTasks::RecurringLogic.new_from_cronline('* * * * *')
      assert recurring_logic.valid_cronline?
      recurring_logic = ::ForemanTasks::RecurringLogic.new_from_cronline('0 22 * * mon-fri')
      assert recurring_logic.valid_cronline?
    end

    it 'can have limited number of repeats' do
      parser = ForemanTasks::RecurringLogic.new_from_cronline('* * * * *')
      parser.state = 'active'
      assert parser.can_continue?
      parser.max_iteration = 5
      parser.expects(:iteration).twice.returns(5)
      assert_not parser.can_continue?
      parser.max_iteration = nil
      time = Time.utc(2015, 9, 29, 15, 0)
      parser.end_time = time
      assert_not parser.can_continue?(time)
      parser.end_time = time + 120
      assert parser.can_continue?(time)
      parser.max_iteration = 5
      assert_not parser.can_continue?(time)
    end

    it 'generates delay options' do
      parser = ForemanTasks::RecurringLogic.new_from_cronline('* * * * *')
      parser.stubs(:id).returns(1)
      reference_time = Time.utc(2015, 9, 29, 15)
      expected_hash = { :start_at => reference_time, :start_before => nil, :recurring_logic_id => parser.id, :frozen => false }
      assert_equal expected_hash, parser.generate_delay_options(reference_time)
      assert_equal expected_hash.merge(:start_before => reference_time + 3600), parser.generate_delay_options(reference_time, 'start_before' => reference_time + 3600)
    end

    it 'can start' do
      recurring_logic = ForemanTasks::RecurringLogic.new_from_cronline('* * * * *')
      ::ForemanTasks.expects(:delay)
      recurring_logic.expects(:save!).twice
      recurring_logic.start(::Support::DummyDynflowAction)
    end

    it 'can start at' do
      recurring_logic = ForemanTasks::RecurringLogic.new_from_cronline('* * * * *')
      future_time = (Time.zone.now + 1.week).change(:sec => 0)
      recurring_logic.start_after(::Support::DummyRecurringDynflowAction, future_time)
      # Able to start at same time as it is valid for * * * * *
      target_time = future_time
      assert_equal target_time, recurring_logic.tasks.first.start_at
    end

    it 'can start at scheduled time' do
      future_time = (Time.zone.now + 2.minutes).change(:sec => 0)
      cron = future_time.min.to_s + " * * * *"
      recurring_logic = ForemanTasks::RecurringLogic.new_from_cronline(cron)
      recurring_logic.start_after(::Support::DummyRecurringDynflowAction, future_time)
      assert_equal future_time, recurring_logic.tasks.first.start_at
    end

    it 'has a task group associated to all tasks that were created as part of the recurring logic' do
      recurring_logic = ForemanTasks::RecurringLogic.new_from_cronline('* * * * *')
      recurring_logic.save
      assert_kind_of ForemanTasks::TaskGroups::RecurringLogicTaskGroup, recurring_logic.task_group
      task = FactoryBot.build(:dynflow_task, :user_create_task)
      task.task_groups << Support::DummyTaskGroup.new
      task.save!
      recurring_logic.task_group.tasks << task
      assert_includes recurring_logic.task_groups, *task.task_groups
    end

    it 'can be created from triggering' do
      triggering = FactoryBot.build(:triggering, :recurring, :end_time_limited)
      logic = ForemanTasks::RecurringLogic.new_from_triggering(triggering)
      # Mysql coerces the times a bit
      assert_in_delta triggering.end_time, logic.end_time, 1.second
    end

    it 'cannot trigger tasks when cancelled' do
      recurring_logic = ForemanTasks::RecurringLogic.new_from_cronline('* * * * *')
      recurring_logic.state = 'cancelled'
      recurring_logic.expects(:can_continue?).never
      recurring_logic.trigger_repeat('this is not important', 'neither is this')
    end

    describe 'enable/disable' do
      let(:logic) do
        recurring_logic = ForemanTasks::RecurringLogic.new_from_cronline('0 15 * * *')

        future_time = Time.zone.now - 1.week
        recurring_logic.start(::Support::DummyRecurringDynflowAction, future_time)
        recurring_logic
      end

      it 'properly updates on disable' do
        logic.update!(:enabled => false)

        assert_equal 'disabled', logic.state

        task = logic.tasks.find_by(:state => 'scheduled')
        assert ForemanTasks.dynflow.world.persistence.load_delayed_plan(task.execution_plan.id).frozen
      end

      it 'handles if the task has been deleted' do
        logic.tasks.find_by(:state => 'scheduled').destroy
        logic.update!(:enabled => false)
        assert_equal 'disabled', logic.state
      end

      it 'properly re-enables on disable' do
        logic.update!(:enabled => false)
        logic.update!(:enabled => true)

        assert_equal 'active', logic.state

        task = logic.tasks.find_by(:state => 'scheduled')
        assert_not ForemanTasks.dynflow.world.persistence.load_delayed_plan(task.execution_plan.id).frozen
        assert task.start_at > Time.zone.now
      end
    end

    describe 'validation' do
      let(:logic) { FactoryBot.build(:recurring_logic) }

      it 'is valid by default' do
        assert logic.valid?
      end

      it 'is invalid when end time in past' do
        logic.end_time = (Time.zone.now - 120)
        assert_not logic.valid?
      end

      it 'is invalid when iteration limit < 1' do
        logic.max_iteration = 0
        assert_not logic.valid?
      end

      it 'is valid when in active state' do
        logic.end_time = (Time.zone.now - 120)
        assert_not logic.valid?
        logic.state = 'active'
        assert logic.valid?
      end
    end
  end
end
