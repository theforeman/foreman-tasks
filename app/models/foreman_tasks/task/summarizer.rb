module ForemanTasks
  class Task::Summarizer
    def summarize_by_status(since = nil)
      result = ::ForemanTasks::Task.where("result <> 'success'")
                                   .select('count(state) AS count, state, result, max(started_at) AS started_at')
                                   .group(:state, :result).order(:state)
      result = result.where('started_at > ?', since) if since
      result
    end

    def latest_tasks_in_errors_warning(limit = 5)
      ::ForemanTasks::Task.where('result in (?)', %w[error warning]).order('started_at DESC').limit(limit)
    end
  end
end
