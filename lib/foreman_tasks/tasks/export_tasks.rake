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

        unless filters_provided?
          filter = "started_at > \"#{7.days.ago.to_s(:db)}\" || " \
                   "(result != success && started_at > \"#{60.days.ago.to_s(:db)}\")"
        else
          filters = []
          filters << task_search if task_search
          # Select tasks with specified ids
          filters << search_many('id', task_ids) if task_ids
          # Select tasks in specified states
          filters << search_many('state', task_states) if task_states
          # Select tasks with specified results
          filters << search_many('result', task_results) if task_results
          # Limit selection by age
          filters << "started_at > \"#{task_days.to_i.days.ago.to_s(:db)}\"" if task_days
          filter = filters.map { |expr| wrap(expr) }.join(' and ')
        end

        filter
      end

      def task_search
        ENV['task_search'] || @task_search
      end

      def filters_provided?
        super || task_search
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

      private

      def search_many(kind, values)
        values.map { |value| "#{kind} = #{value}" }.join(' or ')
      end

      def wrap(expression)
        '(' + expression + ')'
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
  * TASK_STATES     : Comma separated list of states
  * TASK_RESULTS    : Comma separated list of results
  * TASK_IDS        : Comma separated list of ids

If TASK_DAYS, TASK_STATES, TASK_RESULTS, TASK_SEARCH or TASK_IDS is defined, they are all applied. Otherwise it defaults to all tasks in the past 7 days and
all unsuccessful tasks in the past 60 days. The default TASK_FORMAT is html
which requires a tar.gz file extension.
DESC

  task :export_tasks => :environment do
    export_task = ForemanTasks::Tasks::Export.new
    Rake::Task[export_task.name].invoke
  end
end
