module Actions
  module ObservableAction
    def self.included(base)
      base.include ::Foreman::Observable
      base.execution_plan_hooks.use :emit_event, :on => :stopped

      def base.event_name
        # actions/remote_execution/run_host_job_stopped
        ::Foreman::Observable.event_name_for(to_s.underscore + '_stopped')
      end
    end

    def emit_event(execution_plan)
      return unless root_action?

      trigger_hook self.class.event_name, payload: event_payload(execution_plan)
    end

    # { "id"=>"10abd90e-bcb7-4568-a68c-679701a2b2f7",
    #   "type"=>"ForemanTasks::Task::DynflowTask",
    #   "label"=>"Actions::RemoteExecution::RunHostJob",
    #   "started_at"=>Tue, 15 Dec 2020 12:14:48 UTC +00:00,
    #   "ended_at"=>Tue, 15 Dec 2020 12:14:48 UTC +00:00,
    #   "state"=>"stopped",
    #   "result"=>"error",
    #   "external_id"=>"66e2781a-379f-430b-8a2b-31a5035ec026",
    #   "parent_task_id"=>"21a4539a-76a1-404c-b98b-0ee86b169e74",
    #   "start_at"=>Tue, 15 Dec 2020 12:14:48 UTC +00:00,
    #   "start_before"=>nil,
    #   "action"=>"Remote action: Run ls -la / on allen-touhy.logan-minteer.rene-henandez.example.net",
    #   "user_id"=>4,
    #   "state_updated_at"=>Tue, 15 Dec 2020 12:14:48 UTC +00:00 }
    def event_payload(_execution_plan)
      task.attributes
    end
  end
end
