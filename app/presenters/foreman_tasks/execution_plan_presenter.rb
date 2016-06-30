module ForemanTasks
  class ExecutionPlanPresenter

    attr_accessor :task

    def initialize(task)
      @task = task
    end

    def plan
      output = []
      @execution_plan = @task.execution_plan
      output << {'run' => process_flow(@execution_plan.run_flow)}
      output << {'finalize' => process_flow(@execution_plan.finalize_flow)}
      output
    end

    def process_flow(flow)
      case flow
      when ::Dynflow::Flows::Sequence
        steps = flow.flows.collect do |step|
          process_flow(step)
        end
        {'type' => 'sequence', 'steps' => steps}
      when ::Dynflow::Flows::Concurrence
        steps = flow.flows.collect do |step|
          process_flow(step)
        end
        {'type' => 'concurrence', 'steps' => steps}
      when ::Dynflow::Flows::Atom
        {'type' => 'atom', 'step' => process_atom(flow)}
      end
    end

    def process_atom(atom)
      @execution_plan.steps[atom.step_id].to_hash
    end

  end
end
