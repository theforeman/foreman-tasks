Foreman::Application.routes.draw do
  namespace :foreman_tasks do
    resources :task_schedules, :only => [:index, :show] do
      member do
        post :cancel
      end
    end

    resources :tasks, :only => [:index, :show] do
      collection do
        get 'auto_complete_search'
      end
      member do
        get :sub_tasks
        post :cancel
        post :resume
        post :unlock
        post :force_unlock
        post :cancel_step
      end
    end

    namespace :api do
      resources :recurring_logics, :only => [:index, :show] do
        member do
          post :cancel
        end
      end

      resources :task_schedules, :only => [:index, :show] do
        member do
          post :cancel
        end
      end

      resources :tasks, :only => [:show, :index] do
        collection do
          post :bulk_search
          post :bulk_resume
          get :summary
          post :callback
        end
      end
    end

    if ForemanTasks.dynflow.required?
      require 'dynflow/web'
      mount ForemanTasks.dynflow.web_console => '/dynflow'
    end
  end
end
