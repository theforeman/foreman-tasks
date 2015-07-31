module ForemanTasks
  class TasksHeaderMenu
    def self.updater_script
      '<script src="/assets/foreman_tasks/application.js"></script>'
    end

    def self.task_state_summary
      lambda do
        [updater_script,
        '<span class="task-results">',
        'tasks status pending:',
        '<span class="badge badge-warning task-count pending">',
        ForemanTasks::Task::Summarizer.new.summarize_by_result.all.find{ |sum| sum.result == 'pending'}.try(:count).to_s,
        '</span> ',
        '</span> ',
        '<span class="task-results">',
        'error: ',
        '<span class="badge badge-important task-count error">',
        ForemanTasks::Task::Summarizer.new.summarize_by_result.all.find{ |sum| sum.result == 'error'}.try(:count).to_s,
        '</span>',
        '</span> ',
        ].join
      end
    end

    def self.caption_for_task_state_tasks(state, result)
      lambda do
        summary = ForemanTasks::Task::Summarizer.new.summarize_by_status.all.find do |sum|
          sum.result == result && sum.state == state
        end
        "#{state}/#{result}: " + (summary.nil? ? "0" : summary.try(:count).to_s)
      end
    end

    def create_menu(initializer_context)
      initializer_context.sub_menu :header_menu, :redhat_access_menu, :caption=> TasksHeaderMenu.task_state_summary do
        states = ['stopped', 'paused', 'running']
        results = ['success', 'error', 'pending']
        states.each do |state|
          results.each do |result|
            initializer_context.menu :header_menu, "#{state}_#{result}", :caption=> TasksHeaderMenu.caption_for_task_state_tasks(state,result),
              :html => {:class => "#{state}_#{result} task-status"},
              :url => "/foreman_tasks/tasks?#{ {:search => {"state" => state, 'result' => result}.to_query}.to_query }",
              :url_hash => {:controller=> :"foreman_tasks/tasks", :action=>:index, :search => "state=#{state}&result=#{result}"},
              :engine => ForemanTasks::Engine
          end
        end
      end
    end
  end
end
