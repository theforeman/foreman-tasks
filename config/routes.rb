Foreman::Application.routes.draw do
  namespace :foreman_tasks do
    resources :tasks, :only => [:index, :show] do
      collection do
        get 'auto_complete_search'
      end
      member do
        post :stop
        post :resume
        post :force_stop
      end
    end

    namespace :api do
      resources :tasks, :only => [:show] do
        post :bulk_search, :on => :collection
      end
    end

    if ForemanTasks.dynflow.required?
      require 'dynflow/web_console'
      mount ForemanTasks.dynflow.web_console => "/dynflow"
    end
  end
end
