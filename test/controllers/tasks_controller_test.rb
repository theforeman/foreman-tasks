require 'foreman_tasks_test_helper'

module ForemanTasks
  class TasksControllerTest < ActionController::TestCase
    describe ForemanTasks::TasksController do
      basic_index_test('tasks')
      basic_pagination_per_page_test
      basic_pagination_rendered_test

      # rubocop:disable Style/AccessorMethodName
      def get_factory_name
        :dynflow_task
      end
      # rubocop:enable Style/AccessorMethodName
    end
  end
end
