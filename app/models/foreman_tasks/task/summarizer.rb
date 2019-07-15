module ForemanTasks
  class Task::Summarizer
    ENSURED_STATE_KEYS = %w[running paused stopped scheduled].freeze
    ENSURED_RESULT_KEYS = %w[success error warning].freeze

    # number of recent/total tasks for specific classification (state/result)
    class Record
      def initialize
        @data = { recent: 0, total: 0 }
      end

      def to_h
        @data.dup
      end

      # updates `field` (one of [:recent, :total]) with counts from aggregated_scope
      def update(field, counts)
        raise ArgumentError, "Unexpected field #{field}" unless @data.key?(field)
        @data[field] = counts.sum(&:count)
      end
    end

    # number of recent/total tasks for specific state + distribution across different results
    # in `by_result` attribute
    class RecordWithResult < Record
      attr_reader :by_result

      def initialize
        super
        @by_result = Hash.new { |h, k| h[k] = Record.new }
        ENSURED_RESULT_KEYS.each { |result_value| @by_result[result_value] = Record.new }
      end

      def to_h
        by_result_hash = @by_result.each.with_object({}) do |(result, record), hash|
          hash[result] = record.to_h
        end
        super.update(by_result: by_result_hash)
      end

      # Updates the `field` summary + grouping by result
      def update(field, counts)
        super(field, counts)
        counts.group_by(&:result).each do |(result, result_counts)|
          @by_result[result].update(field, result_counts)
        end
      end
    end

    def initialize(scope = Task.authorized, recent_timeframe = 24)
      @recent_timeframe = recent_timeframe.hours
      @scope = scope
    end

    def summarize_by_status
      aggregated_scope.where("result <> 'success'")
    end

    def latest_tasks_in_errors_warning(limit = 5)
      @scope.where('result in (?)', %w[error warning]).order('started_at DESC').limit(limit)
    end

    # Returns summary of tasks count, grouped by `state` and `result`, if form of:
    #
    #    { 'running'   => { recent: 3, total: 6 },
    #      'paused'    => { recent: 1, total: 3 },
    #      'stopped'   => { recent: 3, total: 7,
    #                       by_result: {
    #                         'success' => { recent: 2, total: 4 },
    #                         'warning' => { recent: 1, total: 2 },
    #                         'error'   => { recent: 0, total: 1 },
    #                       }}
    #      'scheduled' => { recent: 0, total: 3 }}
    #
    def summary
      @summary = Hash.new { |h, state| h[state] = Record.new }
      ENSURED_STATE_KEYS.each do |state|
        @summary[state] = state == 'stopped' ? RecordWithResult.new : Record.new
      end

      add_to_summary(aggregated_scope, :total)
      add_to_summary(aggregated_recent_scope, :recent)

      @summary.each.with_object({}) do |(key, record), hash|
        hash[key] = record.to_h
      end
    end

    private

    def add_to_summary(aggregated_scope, field)
      aggregated_scope.group_by(&:state).each do |(state, state_counts)|
        @summary[state].update(field, state_counts)
      end
    end

    def aggregated_scope
      @scope.select('count(state) AS count, state, result, max(started_at) AS started_at')
            .group(:state, :result).order(:state)
    end

    def aggregated_recent_scope
      aggregated_scope.where("state_updated_at > ?", Time.now.utc - @recent_timeframe)
    end
  end
end
