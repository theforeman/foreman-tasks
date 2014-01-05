namespace :foreman_tasks do
  namespace :dynflow do
    task :executor  do
      ForemanTasks.dynflow.executor!
      puts 'Loading Rails environment...'
      Rake::Task[:environment].invoke
      puts 'Executor is ready'
      ForemanTasks::Dynflow::Daemon.new.run
    end
  end
end
