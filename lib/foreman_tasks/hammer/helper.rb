module ForemanTasks
  module Hammer
    module Helper
      # render the progress of the task using polling to the task API
      def task_progress(task_or_id)
        task_id = task_or_id.is_a?(Hash) ? task_or_id['id'] : task_or_id
        ForemanTasks::Hammer::TaskProgress.new(task_id) { |id| load_task(id) }.tap do |task_progress|
          task_progress.render
        end
      end

      def load_task(id)
        options = resource_config.merge(resource_config[:credentials].to_params)
        client = ForemanApi::Base.new(options)
        flatten_task(client.http_call(:get, "/foreman_tasks/api/tasks/#{id}").first)
      end

      def send_request
        flatten_task(super)
      end

      # make sure to flatten the nested data, to use it easily in
      # success_message, such as
      #
      #   success_messasge "Repository is being synchronized in task %{id}s"
      #
      def flatten_task(task)
        if task.key?('id')
          return task
        else
          return task.values.first
        end
      end
    end
  end
end
