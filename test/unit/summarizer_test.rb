require 'foreman_tasks_test_helper'

class SummarizerTest < ActiveSupport::TestCase
  before do
    ::ForemanTasks::Task.delete_all
  end

  describe ForemanTasks::Task::Summarizer do
    before do
      build_tasks
    end

    let :subject do
      ForemanTasks::Task::Summarizer.new
    end

    let :expected do
      { 'running' => { recent: 3, total: 6 },
        'stopped' => { recent: 3, total: 7,
                       by_result: {
                         'success' => { recent: 2, total: 4 },
                         'warning' => { recent: 1, total: 2 },
                         'error' => { recent: 0, total: 1 }
                       } } }
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

    # rubocop:disable Performance/TimesMap
    def build_tasks
      expected.each do |(state, status_summary)|
        tasks = status_summary[:total].times.map do
          ForemanTasks::Task.create(type: ForemanTasks::Task.name,
                                    label: 'test',
                                    state: state,
                                    result: 'pending').tap do |task|
            task.update(state_updated_at: nil)
          end
        end
        recent_tasks = tasks.take(status_summary[:recent])
        recent_tasks.each { |t| t.update(state_updated_at: Time.now.utc) }

        untouched_recent_tasks = recent_tasks
        untouched_old_tasks = tasks - recent_tasks
        status_summary.fetch(:by_result, {}).each do |(result, result_summary)|
          result_summary[:recent].times do |_i|
            task = untouched_recent_tasks.shift
            task.update(result: result)
          end

          (result_summary[:total] - result_summary[:recent]).times do |_i|
            task = untouched_old_tasks.shift
            task.update(result: result)
          end
        end
      end
      # rubocop:enable Performance/TimesMap
    end
  end
end
