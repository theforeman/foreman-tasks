module Actions
  class Base < Dynflow::Action

    # This method says what data form input gets into the task details in Rest API
    # By default, it sends the whole input there.
    def task_input
      self.input
    end

    # This method says what data form output gets into the task details in Rest API
    # It should aggregate the important data that are worth to propagate to Rest API,
    # perhaps also aggraget data from subactions if needed (using +all_actions+) method
    # of Dynflow::Action::Presenter
    def task_output
      self.output
    end

    # This method should return humanized description of the action, e.g. "Install package"
    def humanized_name
      self.class.name.demodulize.underscore.humanize
    end

    # This method should return String or Array<String> describing input for the task
    def humanized_input
      if task_input.blank?
        ""
      else
        task_input.pretty_inspect
      end
    end

    # This method should return String describing output for the task.
    # It should aggregate the data from subactions as well and it's used for humanized
    # description of restuls of the action
    def humanized_output
      if task_output.blank?
        ""
      else
        task_output.pretty_inspect
      end
    end

    # This method should return String or Array<String> describing the errors during the action
    def humanized_errors
      execution_plan.steps_in_state(:skipped, :skipping, :error).map do |step|
        step.error.message if step.error
      end.compact
    end
  end
end
