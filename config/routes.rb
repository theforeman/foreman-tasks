Foreman::Application.routes.draw do
  namespace :foreman_tasks do
    resources :recurring_logics, :only => [:index, :show] do
      member do
        post :cancel
        put :enable
        put :disable
      end
    end

    resources :tasks, :only => [:index, :show] do
      collection do
        get 'auto_complete_search'
        get '/summary/:recent_timeframe', action: 'summary'
      end
      member do
        get :sub_tasks
        post :abort
        post :cancel
        post :resume
        post :unlock
        post :force_unlock
        post :cancel_step
      end
    end

    match '/ex_tasks' => 'react#index', :via => [:get]
    match '/ex_tasks/:id' => 'react#index', :via => [:get]

    namespace :api do
      resources :recurring_logics, :only => [:index, :show, :update] do
        member do
          post :cancel
        end
      end

      resources :tasks, :only => [:show, :index] do
        member do
          get :details
        end
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
      if defined? ::Sidekiq
        require 'sidekiq/web'
        redis_url = SETTINGS.dig(:dynflow, :redis_url)
        Sidekiq.redis = { url: redis_url }
        Sidekiq::Web.set :sessions, false
        mount Sidekiq::Web => '/sidekiq', :constraints => ForemanTasks::Dynflow::SidekiqConsoleConstraint.new
      end
    end
  end
end
