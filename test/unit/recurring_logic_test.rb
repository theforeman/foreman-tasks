require 'foreman_tasks_test_helper'

class RecurringLogicsTest < ActiveSupport::TestCase
  describe 'generating times' do
    it 'assembles cronline' do
      hash = {}
      ForemanTasks::RecurringLogic.assemble_cronline(hash).must_equal '* * * * *'
      hash.update :minutes => '*'
      ForemanTasks::RecurringLogic.assemble_cronline(hash).must_equal '* * * * *'
      hash.update :hours => '0,12'
      ForemanTasks::RecurringLogic.assemble_cronline(hash).must_equal '* 0,12 * * *'
      hash.update :days => '*/2'
      ForemanTasks::RecurringLogic.assemble_cronline(hash).must_equal '* 0,12 */2 * *'
      hash.update :months => '12'
      ForemanTasks::RecurringLogic.assemble_cronline(hash).must_equal '* 0,12 */2 12 *'
      hash.update :days_of_week => '1,2,3,4,5,6,7'
      ForemanTasks::RecurringLogic.assemble_cronline(hash).must_equal '* 0,12 */2 12 1,2,3,4,5,6,7'
    end

    it 'generates correct times' do
      year = 2015
      month = 9
      day = 29
      hour = 15
      minute = 0
      reference_time = Time.utc(year, month, day, hour, minute)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('* * * * *')
      parser.next_occurrence_time(reference_time).must_equal Time.utc(year, month, day, hour, minute)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('*/2 * * * *')
      parser.next_occurrence_time(reference_time).must_equal Time.utc(year, month, day, hour, minute)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('*/2 18,19 * * *')
      parser.next_occurrence_time(reference_time).must_equal Time.utc(year, month, day, 18)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('*/2 18,19 10 * *')
      parser.next_occurrence_time(reference_time).must_equal Time.utc(year, month + 1, 10, 18, minute)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('*/2 18,19 10 11,12 *')
      parser.next_occurrence_time(reference_time).must_equal Time.utc(year, 11, 10, 18, 0)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('* * * * 1')
      parser.next_occurrence_time(reference_time).must_equal Time.utc(year, month + 1, 5)
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
      ForemanTasks::RecurringLogic.cronline_hash(:hourly,  time_hash, days, days_of_week).must_equal expected_result_hourly
      ForemanTasks::RecurringLogic.cronline_hash(:daily,   time_hash, days, days_of_week).must_equal expected_result_daily
      ForemanTasks::RecurringLogic.cronline_hash(:weekly,  time_hash, days, days_of_week).must_equal expected_result_weekly
      ForemanTasks::RecurringLogic.cronline_hash(:monthly, time_hash, days, days_of_week).must_equal expected_result_monthly
    end

    it 'can have limited number of repeats' do
      parser = ForemanTasks::RecurringLogic.new_from_cronline('* * * * *')
      parser.state = 'active'
      parser.must_be :can_continue?
      parser.max_iteration = 5
      parser.expects(:iteration).twice.returns(5)
      parser.wont_be :can_continue?
      parser.max_iteration = nil
      time = Time.utc(2015, 9, 29, 15, 0)
      parser.end_time = time
      parser.wont_be :can_continue?, time
      parser.end_time = time + 120
      parser.must_be :can_continue?, time
      parser.max_iteration = 5
      parser.wont_be :can_continue?, time
    end

    it 'generates delay options' do
      parser = ForemanTasks::RecurringLogic.new_from_cronline('* * * * *')
      parser.stubs(:id).returns(1)
      reference_time = Time.utc(2015, 9, 29, 15)
      expected_hash = { :start_at => reference_time, :start_before => nil, :recurring_logic_id => parser.id, :frozen => false }
      parser.generate_delay_options(reference_time).must_equal expected_hash
      parser.generate_delay_options(reference_time, 'start_before' => reference_time + 3600)
            .must_equal expected_hash.merge(:start_before => reference_time + 3600)
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
      recurring_logic.task_group.must_be_kind_of ForemanTasks::TaskGroups::RecurringLogicTaskGroup
      task = FactoryBot.build(:dynflow_task, :user_create_task)
      task.task_groups << Support::DummyTaskGroup.new
      task.save!
      recurring_logic.task_group.tasks << task
      recurring_logic.task_groups.must_include(*task.task_groups)
    end

    it 'can be created from triggering' do
      triggering = FactoryBot.build(:triggering, :recurring, :end_time_limited)
      logic = ForemanTasks::RecurringLogic.new_from_triggering(triggering)
      # Mysql coerces the times a bit
      logic.end_time.must_be_close_to(triggering.end_time, 1.second)
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
        logic.must_be :valid?
      end

      it 'is invalid when end time in past' do
        logic.end_time = (Time.zone.now - 120)
        logic.wont_be :valid?
      end

      it 'is invalid when iteration limit < 1' do
        logic.max_iteration = 0
        logic.wont_be :valid?
      end

      it 'is valid when in active state' do
        logic.end_time = (Time.zone.now - 120)
        logic.wont_be :valid?
        logic.state = 'active'
        logic.must_be :valid?
      end
    end
  end
end
