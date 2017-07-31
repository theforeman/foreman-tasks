require 'foreman_tasks_test_helper'

module ForemanTasks
  class TasksControllerTest < ActionController::TestCase

    describe ForemanTasks::TasksController do
      basic_pagination_per_page_test
      basic_pagination_rendered_test

      def get_factory_name
        :dynflow_task
      end
    end
  end
end
