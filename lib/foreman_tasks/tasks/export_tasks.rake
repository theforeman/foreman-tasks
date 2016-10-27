#
# export_tasks.rake is a debugging tool to extract tasks from the
# current foreman instance.
#
# Run "foreman-rake foreman_tasks:export_tasks" to export tasks

require 'csv'

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
    deprecated_options = {:tasks => "TASK_SEARCH",
                          :days => "TASK_DAYS",
                          :export => "TASK_FILE"
    }
    deprecated_options.each do |option, new_option|
      fail "The #{option} option is deprecated. Please use #{new_option} instead" if ENV.include?(option.to_s)
    end

    if ENV['TASK_SEARCH'].nil? && ENV['TASK_DAYS'].nil?
      filter = "started_at > \"#{7.days.ago.to_s(:db)}\" || " \
        "(result != success && started_at > \"#{60.days.ago.to_s(:db)})\""
    else
      filter = ENV['TASK_SEARCH'] || ''
    end

    if (days = ENV['TASK_DAYS'])
      filter += " && " unless filter == ''
      filter += "started_at > \"#{days.to_i.days.ago.to_s(:db)}\""
    end

    format = ENV['TASK_FORMAT'] || 'html'
    export_filename = ENV['TASK_FILE'] || "/tmp/task-export-#{DateTime.now.to_i}.#{format == 'csv' ? 'csv' : 'tar.gz'}"

    tasks = ForemanTasks::Task.search_for(filter)
    plans = tasks.map(&:external_task)

    puts _("Gathering #{tasks.count} tasks.")
    content = case format
              when 'html'
                ::Dynflow::Exporters::Tar.full_html_export plans
              when 'json'
                ::Dynflow::Exporters::Tar.full_html_export plans
              when 'csv'
              else
                raise "Unknown export format '#{format}'"
              end
    File.write(export_filename, content)
      
        # elsif format == 'csv'
    #   CSV.open(export_filename, 'wb') do |csv|
    #     csv << ['id', 'state', 'type', 'label', 'result', 'parent_task_id', 'started_at', 'ended_at']
    #     tasks.each do |task|
    #       csv << [task.id, task.state, task.type, task.label, task.result,
    #               task.parent_task_id, task.started_at, task.ended_at]
    #     end
    #   end
    # end

    puts "Created #{export_filename}"

  end
end
