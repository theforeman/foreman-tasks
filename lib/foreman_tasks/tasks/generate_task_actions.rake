#
# generate_task_actions.rake is a data migration task to properly fill the missing
# values into the foreman_tasks_tasks table.
#
# Run "foreman-rake foreman_tasks:generate_task_actions" to generate missing values.

namespace :foreman_tasks do
  desc 'Generate missing values for action column in foreman_tasks_tasks table.'

  BATCH_SIZE = 100

  task :generate_task_actions => :environment do
    class ProgressReporter
      def initialize(count, message = nil)
        @count = count
        @processed = 0
        puts message % { :count => count } unless message.nil?
      end

      def progress(count)
        @processed += count
      end

      def report
        puts _('Processed %{processed}/%{count} tasks') % { :processed => @processed, :count => @count }
      end
    end

    scope = ::ForemanTasks::Task.where(:action => nil).order(:started_at => :desc)
    count = scope.count
    reporter = ProgressReporter.new count, _('Generating action for %{count} tasks.')
    scope.find_in_batches(:batch_size => BATCH_SIZE) do |group|
      group.each do |task|
        task.action = task.to_label
        task.save!
      end
      reporter.progress group.size
      reporter.report
    end
  end
end
