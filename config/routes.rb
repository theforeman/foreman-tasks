Foreman::Application.routes.draw do
  namespace :foreman_tasks do
    resources :tasks, :only => :index
  end
end
