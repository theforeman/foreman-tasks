module ForemanTasks
  class ReactController < ::ApplicationController
    skip_before_action :authorize

    include Rails.application.routes.url_helpers

    def index
      render 'foreman_tasks/layouts/react', :layout => false
    end
  end
end
