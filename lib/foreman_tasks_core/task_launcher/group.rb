require 'foreman_tasks_core/runner'

module ForemanTasksCore
  module TaskLauncher
    class AbstractGroup < Batch
      def self.runner_class
        raise NotImplementedError
      end

      def launch!(input)
        trigger(nil, SingleRunnerBatchAction, self, input)
      end

      def launch_children(parent, input_hash)
        super(parent, input_hash)
        trigger(parent, BatchRunnerAction, self, input_hash)
      end

      def operation
        raise NotImplementedError
      end

      def runner_input(input)
        input.reduce({}) do |acc, (id, input)|
          input = { :execution_plan_id => results[id][:task_id],
                    :run_step_id => 2,
                    :input => input }
          acc.merge(id => input)
        end
      end

      private

      def child_launcher(parent)
        Single.new(world, callback, :parent => parent, :action_class_override => OutputCollectorAction)
      end

      def transform_input(input)
        wipe_callback(input)
      end

      def wipe_callback(input)
        callback = input['action_input']['callback']
        input.merge('action_input' => input['action_input'].merge('callback' => nil, :task_id => callback['task_id']))
      end
    end
  end
end
