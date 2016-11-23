#
# export_tasks.rake is a debugging tool to extract tasks from the
# current foreman instance.
#
# Run "foreman-rake foreman_tasks:export_tasks" to export tasks

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

  def filter(task)
    filter = ''

    if task.task_search.nil? && task.task_days.nil?
      filter = "started_at > \"#{7.days.ago.to_s(:db)}\" || " \
               "(result != success && started_at > \"#{60.days.ago.to_s(:db)}\")"
    else
      filter = task.task_search || ''
    end

    if (days = task.task_days)
      filter += " && " unless filter == ''
      filter += "started_at > \"#{days.to_i.days.ago.to_s(:db)}\""
    end

    filter
  end

  def plans(world, filter)
    puts "Retrieveing plans!"
    ids = ForemanTasks::Task.search_for(filter).pluck(:external_id)
    world.persistence.find_execution_plans(:filters => { :uuid => ids })
  end

  task :export_tasks => :environment do

    export_task = ::Dynflow::Tasks::Export.new do |t|
      t.world = ForemanTasks.dynflow.world
      t.plans = plans(t.world, filter(t))
    end

    Rake::Task[export_task.name].invoke
  end
end
