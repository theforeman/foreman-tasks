module ForemanTasks
  class Task::DynflowTask < ForemanTasks::Task

    scope :for_action, ->(action_class) { where(label: action_class.name) }

    def update_from_dynflow(data, planned)
      self.external_id = data[:id]
      self.started_at  = data[:started_at]
      self.ended_at    = data[:ended_at]
      self.state       = data[:state].to_s
      self.result      = data[:result].to_s

      if planned
        # for now, this part needs to laod the execution_plan to
        # load extra data, there is place for optimization on Dynflow side
        # if needed (getting more keys into the data value)
        unless self.label
          self.label = main_action.class.name
        end
        update_progress
      end
      self.save!
    end

    def update_progress
      self.progress = execution_plan.progress
    end

    def execution_plan
      @execution_plan ||= ForemanTasks.dynflow.world.persistence.load_execution_plan(external_id)
    end

    def input
      main_action.respond_to?(:task_input) && main_action.task_input
    end

    def output
      main_action.respond_to?(:task_output) && main_action.task_output
    end

    def humanized
      { action: main_action.respond_to?(:humanized_name) && main_action.humanized_name,
        input:  main_action.respond_to?(:humanized_input) && main_action.humanized_input,
        output: main_action.respond_to?(:humanized_output) && main_action.humanized_output }
    end

    def cli_example
      if main_action.respond_to?(:cli_example)
        main_action.cli_example
      end
    end

    def main_action
      return @main_action if @main_action
      execution_plan.root_plan_step.action execution_plan
    end
  end
end
