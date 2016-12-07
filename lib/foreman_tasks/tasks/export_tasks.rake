#
# export_tasks.rake is a debugging tool to extract tasks from the
# current foreman instance.
#
# Run "foreman-rake foreman_tasks:export_tasks" to export tasks

module ForemanTasks
  module Tasks
    class Export < ::Dynflow::Tasks::Export

      def filter
        filter = ''

        if task_search.nil? && task_days.nil?
          filter = "started_at > \"#{7.days.ago.to_s(:db)}\" || " \
                   "(result != success && started_at > \"#{60.days.ago.to_s(:db)}\")"
        else
          filter = task_search || ''
        end

        if (days = task_days)
          filter += " && " unless filter == ''
          filter += "started_at > \"#{days.to_i.days.ago.to_s(:db)}\""
        end

        filter
      end

      def plans
        return @plans if @plans
        puts "Retrieving plans"
        ids = ForemanTasks::Task.search_for(filter).pluck(:external_id)
        @plans = world.persistence.find_execution_plans(:filters => { :uuid => ids })
      end

      def world
        ForemanTasks.dynflow.world
      end

    end
  end
end

namespace :foreman_tasks do
  desc <<DESC
Export dynflow tasks based on filter. ENV variables:

  * TASK_SEARCH     : scoped search filter (example: 'label = "Actions::Foreman::Host::ImportFacts"')
  * TASK_FILE       : file to export to
  * TASK_FORMAT     : format to use for the export (either html or csv)
  * TASK_DAYS       : number of days to go back

If TASK_SEARCH is not defined, it defaults to all tasks in the past 7 days and
all unsuccessful tasks in the past 60 days. The default TASK_FORMAT is html
which requires a tar.gz file extension.
DESC

  task :export_tasks => :environment do
    export_task = ForemanTasks::Tasks::Export.new
    Rake::Task[export_task.name].invoke
  end
end
