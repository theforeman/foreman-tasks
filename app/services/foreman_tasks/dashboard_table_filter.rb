module ForemanTasks
  # narrows the scope for the tasks table based on params coming from tasks dashboard
  #
  # Supported filters:
  #
  #  * :result
  #  * :state
  #  * :time_horizon - expected format of Hxy, where the xy is the time horizon in hours we're interested in
  #      :time_mode can be set to 'recent' to filter the recent tasks, or 'older' (default) to filter earlier ones
  class DashboardTableFilter
    def initialize(scope, params)
      @scope = scope
      @params = params
    end

    def scope
      @new_scope = @scope
      scope_by(:result)
      scope_by(:state)
      scope_by_time
      @new_scope
    end

    private

    def scope_by(field)
      @new_scope = @new_scope.where(field => @params[field]) if @params[field].present?
    end

    def scope_by_time
      return if @params[:time].blank?
      hours = if @params[:time].casecmp('week') == 0
        24 * 7
      else
        @params[:time][/\AH(\d{1,2})$/i, 1]
      end

      unless hours
        raise Foreman::Exception, 'Unexpected format of time: should be in form of "H24" or equal to "week"'
      end
      timestamp = Time.now.utc - hours.to_i.hours
      case @params[:mode]
      when 'recent'
        operator = '>'
      else
        operator = '<'
        search_suffix = 'OR state_updated_at IS NULL'
      end
      @new_scope = @new_scope.where("state_updated_at #{operator} ? #{search_suffix}", timestamp)
    end
  end
end
