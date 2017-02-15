namespace :test do
  task :foreman_tasks => 'db:test:prepare' do
    test_task = Rake::TestTask.new('foreman_tasks_test_task') do |t|
      t.libs << ['test', "#{ForemanTasks::Engine.root}/test"]
      t.test_files = ["#{ForemanTasks::Engine.root}/test/**/*_test.rb"]
      t.verbose = true
      t.warning = false
    end

    Rake::Task[test_task.name].invoke
  end
end

namespace :foreman_tasks do
  task :rubocop do
    begin
      require 'rubocop/rake_task'
      RuboCop::RakeTask.new(:rubocop_foreman_tasks) do |task|
	task.patterns = ["#{ForemanTasks::Engine.root}/app/**/*.rb",
		  "#{ForemanTasks::Engine.root}/lib/**/*.rb",
		  "#{ForemanTasks::Engine.root}/test/**/*.rb"]
      end
    rescue
      puts 'Rubocop not loaded.'
    end

    Rake::Task['rubocop_foreman_tasks'].invoke
  end
end

Rake::Task[:test].enhance do
  Rake::Task['test:foreman_tasks'].invoke
end

load 'tasks/jenkins.rake'
if Rake::Task.task_defined?(:'jenkins:unit')
  Rake::Task['jenkins:unit'].enhance ['foreman_tasks:rubocop', 'test:foreman_tasks']
end
