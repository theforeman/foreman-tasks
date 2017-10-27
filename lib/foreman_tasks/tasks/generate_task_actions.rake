#
# generate_task_actions.rake is a data migration task to properly fill the missing
# values into the foreman_tasks_tasks table.
#
# Run "foreman-rake foreman_tasks:generate_task_actions" to generate missing values.

namespace :foreman_tasks do
  desc 'Generate missing values for action column in foreman_tasks_tasks table.'
  task :generate_task_actions => :environment do
    scope = ::ForemanTasks::Task.where(:action => nil)

    puts "Generating action for #{scope.count} tasks."
    scope.find_each do |task|
      task.action = task.format_input
      task.save!
    end
  end
end
