Foreman::Application.routes.draw do
  namespace :foreman_tasks do
    resources :tasks, :only => [:index, :show] do
      collection do
        get 'auto_complete_search'
      end
      member do
        get :sub_tasks
        post :resume
        post :unlock
        post :force_unlock
        post :cancel_step
      end
    end

    namespace :api do
      resources :tasks, :only => [:show, :index] do
        post :bulk_search, :on => :collection
        post :bulk_resume, :on => :collection
      end
    end

    if ForemanTasks.dynflow.required?
      require 'dynflow/web_console'
      mount ForemanTasks.dynflow.web_console => "/dynflow"
    end
  end
end
