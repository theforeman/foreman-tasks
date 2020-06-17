namespace :dynflow do
  task :client do
    ::ForemanTasks.dynflow.config.remote = true
    ::ForemanTasks.dynflow.initialize!
  end
end
