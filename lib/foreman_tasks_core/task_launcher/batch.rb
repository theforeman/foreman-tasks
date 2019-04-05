module ForemanTasksCore
  module TaskLauncher
    class Batch < Abstract
      def launch!(input)
        trigger(nil, BatchAction, self, input)
      end

      def launch_children(parent, input_hash)
        input_hash.each do |task_id, input|
          launcher = child_launcher(parent)
          launcher.launch!(transform_input(input))
          results[task_id] = launcher.results
        end
      end

      def prepare_batch(input_hash)
        success_tasks = input_hash.select do |task_id, _input|
          results[task_id][:result] == 'success'
        end
        success_tasks.reduce({}) do |acc, (key, value)|
          acc.merge(results[key][:task_id] => value['action_input']['callback'])
        end
      end

      private

      def child_launcher(parent)
        Single.new(world, callback, :parent => parent)
      end

      # Identity by default
      def transform_input(input)
        input
      end
    end
  end
end
