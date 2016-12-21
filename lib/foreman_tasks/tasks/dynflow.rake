namespace :foreman_tasks do
  namespace :dynflow do
    task :executor do
      ForemanTasks::Dynflow::Daemon.new.run
    end
  end
end
