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
      scope_by_result
      scope_by_state
      scope_by_time
      @new_scope
    end

    private

    def scope_by_result
      @new_scope = @new_scope.where(result: @params[:result]) if @params[:result].present?
    end

    def scope_by_state
      @new_scope = @new_scope.where(state: @params[:state]) if @params[:state].present?
    end

    def scope_by_time
      return unless @params[:time_horizon].present?
      hours = @params[:time_horizon][/\A(H)(\d{1,2})$/i, 2]
      unless hours
        raise Foreman::Exception, 'Unexpected format of time: should be in form of "H24"'
      end
      timestamp = Time.now - hours.to_i.hours
      case @params[:time_mode]
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
