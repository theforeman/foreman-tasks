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
  task :export_tasks => :environment do
    deprecated_options = {:tasks  => "TASK_SEARCH",
                          :days   => "TASK_DAYS",
                          :export => "TASK_FILE"
    }

    deprecated_options.each do |option, new_option|
      fail "The #{option} option is deprecated. Please use #{new_option} instead" if ENV.include?(option.to_s)
    end

    utils = ForemanTasks::ExportUtils.new

    puts _("Gathering #{utils.plans.count} tasks.")
    if utils.plans.count.zero?
      puts "Nothing to export"
    else
      utils.export
      puts _("Created #{utils.export_filename}")
    end

  end
end
