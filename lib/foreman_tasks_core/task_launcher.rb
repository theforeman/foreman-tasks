module ForemanTasksCore
  class TaskLauncher
    attr_reader :callback, :results, :world
    def initialize(world, callback, options = {})
      @world = world
      @callback = callback
      @options = {}
      @results = {}
    end

    def launch!(input)
      launch_children(nil, input)
    end

    def launch_children(parent, input_hash)
      input_hash.each do |task_id, input|
        result = trigger(parent,
                         action_class(input),
                         with_callback(input['action_input']))
        @results[task_id] = format_result(result)
      end
      launch_runner(parent, input_hash)
    end

    private

    def launch_runner(parent, input_hash)
    end

    def with_callback(input)
      input.merge(:callback_host => callback)
    end

    def action_class(input)
      ::Dynflow::Utils.constantize(input['action_class'])
    end

    def format_result(result)
      if result.triggered?
        { :result => 'success', :task_id => result.execution_plan_id }
      else
        plan = world.persistence.load_execution_plan(result.id)
        { :result => 'error', :errors => plan.errors }
      end
    end

    def trigger(parent, klass, *input)
      world.trigger { world.plan_with_caller(parent, klass, *input) }
    end
  end
end
   
