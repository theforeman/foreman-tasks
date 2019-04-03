require 'foreman_tasks_test_helper'

class SummarizerTest < ActiveSupport::TestCase
  before do
    ::ForemanTasks::Task.delete_all
  end

  describe ForemanTasks::Task::Summarizer do
    before do
      @tasks_builder = HistoryTasksBuilder.new
      @tasks_builder.build
    end

    let :subject do
      ForemanTasks::Task::Summarizer.new
    end

    let :expected do
      @tasks_builder.distribution
    end

    it 'is able to group tasks counts by state and result' do
      summary = subject.summary
      expected.each do |(state, expected_state_vals)|
        assert_summary(expected_state_vals, summary[state], "summary[#{state}]")
        expected_state_vals.fetch(:by_result, {}).each do |result, expected_result_vals|
          assert_summary expected_result_vals, summary[state][:by_result][result], "summary[#{state}][#{result}]"
        end
      end
    end

    def assert_summary(expected_summary, summary, value_desc)
      %I[recent total].each do |key|
        assert_equal expected_summary[key], summary[key],
                     "#{value_desc}[#{key}] expected to be #{expected_summary[key]}, was #{summary[key]}"
      end
    end
  end
end
