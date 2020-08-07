class HistoryTasksBuilder
  def distribution
    { 'running' => { recent: 3, total: 6 },
      'stopped' => { recent: 3, total: 7,
                     by_result: {
                       'success' => { recent: 2, total: 4 },
                       'warning' => { recent: 1, total: 2 },
                       'error' => { recent: 0, total: 1 },
                     } } }
  end

  # rubocop:disable Performance/TimesMap
  def build
    distribution.each do |(state, status_summary)|
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
