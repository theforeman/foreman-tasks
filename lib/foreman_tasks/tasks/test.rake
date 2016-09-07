namespace :test do
  task :foreman_tasks => 'db:test:prepare' do
    test_task = Rake::TestTask.new('foreman_tasks_test_task') do |t|
      t.libs << ["test", "#{ForemanTasks::Engine.root}/test"]
      t.test_files = ["#{ForemanTasks::Engine.root}/test/**/*_test.rb"]
      t.verbose = true
      t.warning = false
    end

    Rake::Task[test_task.name].invoke
  end
end

Rake::Task[:test].enhance do
  Rake::Task['test:foreman_tasks'].invoke
end

load 'tasks/jenkins.rake'
if Rake::Task.task_defined?(:'jenkins:unit')
  Rake::Task["jenkins:unit"].enhance do
    Rake::Task['test:foreman_tasks'].invoke
  end
end
