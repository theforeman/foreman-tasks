module Actions
  module Middleware
    class InheritTaskGroups < Dynflow::Middleware

      def delay(*args)
        pass *args
      end

      def plan(*args)
        inherit_task_groups
        pass *args
      end

      def run(*args)
        pass *args
        collect_children_task_groups
      end

      def finalize
        pass
      end

      private

      def inherit_task_groups
        task.add_missing_task_groups(task.parent_task.task_groups) if task.parent_task
      end

      def collect_children_task_groups
        task.add_missing_task_groups task.sub_tasks.map(&:task_groups).flatten
      end

      def task
        @task ||= action.task
      end
    end
  end
end

