module ForemanTasks
  class Task::DynflowTask < ForemanTasks::Task

    def update_from_dynflow(data)
      self.external_id = data[:id]
      self.started_at  = data[:started_at]
      self.ended_at    = data[:ended_at]
      self.state       = data[:state].to_s
      self.result      = data[:result].to_s

      # for now, this part needs to laod the execution_plan to
      # load extra data, there is place for optimization on Dynflow side
      # if needed (getting more keys into the data value)
      unless self.label
        self.label = main_action.action_class.name
      end
      update_progress
      self.save!
    end

    def update_progress
      self.progress = execution_plan.progress
    end

    def execution_plan
      @execution_plan ||= ForemanTasks.world.persistence.load_execution_plan(external_id)
    end

    def main_action
      return @main_action if @main_action
      main_action_id = execution_plan.root_plan_step.action_id
      @main_action = execution_plan.actions.find { |action| action.id == main_action_id }
    end
  end
end
