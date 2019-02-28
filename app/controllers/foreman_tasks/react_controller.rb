module ForemanTasks
  class ReactController < ::ApplicationController
    def index
      render 'foreman_tasks/layouts/react', :layout => false
    end

    private

    def controller_permission
      :foreman_tasks
    end

    def action_permission
      :view
    end
  end
end
