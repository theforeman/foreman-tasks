require 'foreman_tasks_test_helper'

class RecurringLogicsTest < ActiveSupport::TestCase

  describe 'generating times' do

    it 'assembles cronline' do
      hash = { }
      ForemanTasks::RecurringLogic.assemble_cronline(hash).must_equal '* * * * *'
      hash.update :minutes => '*'
      ForemanTasks::RecurringLogic.assemble_cronline(hash).must_equal '* * * * *'
      hash.update :hours => '0,12'
      ForemanTasks::RecurringLogic.assemble_cronline(hash).must_equal '* 0,12 * * *'
      hash.update :days => '*/2'
      ForemanTasks::RecurringLogic.assemble_cronline(hash).must_equal '* 0,12 */2 * *'
      hash.update :months  => '12'
      ForemanTasks::RecurringLogic.assemble_cronline(hash).must_equal '* 0,12 */2 12 *'
      hash.update :days_of_week => '1,2,3,4,5,6,7'
      ForemanTasks::RecurringLogic.assemble_cronline(hash).must_equal '* 0,12 */2 12 1,2,3,4,5,6,7'
    end

    it 'generates correct times' do
      year, month, day, hour, minute = [2015, 9, 29, 15, 0]
      reference_time = Time.new(year, month, day, hour, minute)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('* * * * *')
      parser.next_occurrence_time(reference_time).must_equal Time.new(year, month, day, hour, minute + 1)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('*/2 * * * *')
      parser.next_occurrence_time(reference_time).must_equal Time.new(year, month, day, hour, minute + 2)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('*/2 18,19 * * *')
      parser.next_occurrence_time(reference_time).must_equal Time.new(year, month, day, 18)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('*/2 18,19 10 * *')
      parser.next_occurrence_time(reference_time).must_equal Time.new(year, month + 1, 10, 18, minute)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('*/2 18,19 10 11,12 *')
      parser.next_occurrence_time(reference_time).must_equal Time.new(year, 11, 10, 18, 0)
      parser = ForemanTasks::RecurringLogic.new_from_cronline('* * * * 1')
      parser.next_occurrence_time(reference_time).must_equal Time.new(year, month + 1, 5)
    end

    it 'creates correct cronline hash' do
      minutes = '52'
      hours = '12'
      days = '11'
      days_of_week = { '1' => '1', '2' => '0', '3' => '0', '4' => '1', '5' => '0', '6' => '1', '7' => '0' }
      time_hash = { '0' => '2015', '1' => '12', '2' => '11', '3' => hours, '4' => minutes }
      expected_result_hourly  = { :minutes => minutes }
      expected_result_daily   = { :minutes => minutes, :hours => hours }
      expected_result_weekly  = { :minutes => minutes, :hours => hours, :days_of_week => '1,4,6' }
      expected_result_monthly = { :minutes => minutes, :hours => hours, :days => days }
      ForemanTasks::RecurringLogic.cronline_hash(:hourly,  time_hash, days_of_week).must_equal expected_result_hourly
      ForemanTasks::RecurringLogic.cronline_hash(:daily,   time_hash, days_of_week).must_equal expected_result_daily
      ForemanTasks::RecurringLogic.cronline_hash(:weekly,  time_hash, days_of_week).must_equal expected_result_weekly
      ForemanTasks::RecurringLogic.cronline_hash(:monthly, time_hash, days_of_week).must_equal expected_result_monthly
    end

    it 'can have limited number of repeats' do
      parser = ForemanTasks::RecurringLogic.new_from_cronline('* * * * *')
      parser.state = 'active'
      parser.must_be :can_continue?
      parser.max_iteration = 5
      parser.expects(:iteration).twice.returns(5)
      parser.wont_be :can_continue?
      parser.max_iteration = nil
      time = Time.new(2015, 9, 29, 15, 0)
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
      reference_time = Time.new(2015, 9, 29, 15)
      expected_hash = { :start_at => reference_time + 60, :start_before => nil, :recurring_logic_id => parser.id }
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
  end

end
