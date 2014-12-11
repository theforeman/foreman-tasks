namespace :test do
  namespace :foreman_tasks do
    task :test => 'db:test:prepare' do
      test_task = Rake::TestTask.new('foreman_tasks_test_task') do |t|
        t.libs << ["test", "#{ForemanTasks::Engine.root}/test"]
        t.test_files = ["#{ForemanTasks::Engine.root}/test/**/*_test.rb"]
        t.verbose = true
      end

      Rake::Task[test_task.name].invoke
    end
  end
end
