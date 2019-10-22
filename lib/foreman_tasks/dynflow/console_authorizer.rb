module ForemanTasks
  class Dynflow::SidekiqConsoleConstraint
    def matches?(request)
      Setting[:dynflow_enable_console] &&
        (!Setting[:dynflow_console_require_auth] || Dynflow::ConsoleAuthorizer.new(request).allow?)
    end
  end

  class Dynflow::ConsoleAuthorizer
    def self.from_env(env)
      new(Rack::Request.new(env))
    end

    def initialize(request)
      @rack_request = request
      @user_id = @rack_request.session[:user]
      @expires_at = @rack_request.session[:expires_at]
      @user = User.unscoped.where(:id => @user_id).first unless session_expired?
    end

    def allow?
      @user && (unlimited_edit? || authorized_for_task?)
    end

    private

    def session_expired?
      Time.now.to_i > @expires_at.to_i
    end

    def unlimited_edit?
      return true if @user.admin?
      # users with unlimited edit_foreman_tasks can operate with the
      # console no matter what task it is...
      edit_permission = Permission.where(:name => :edit_foreman_tasks, :resource_type => ForemanTasks::Task.name).first
      if @user.filters.joins(:filterings).unlimited.where('filterings.permission_id' => edit_permission).first
        return true
      end
    end

    def authorized_for_task?
      if (task = extract_task)
        begin
          original_user = User.current
          User.current = @user
          return Authorizer.new(@user).can?(:edit_foreman_tasks, task)
        ensure
          User.current = original_user
        end
      else
        false
      end
    end

    def extract_task
      dynflow_id = @rack_request.path_info[/^\/([\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})/, 1]
      unless dynflow_id.empty?
        ForemanTasks::Task::DynflowTask.where(:external_id => dynflow_id).first
      end
    end
  end
end
