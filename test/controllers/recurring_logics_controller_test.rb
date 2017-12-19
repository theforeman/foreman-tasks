require 'foreman_tasks_test_helper'

module ForemanTasks
  class RecurringLogicsControllerTest < ActionController::TestCase
    basic_index_test('recurring_logics')
    basic_pagination_per_page_test

    # rubocop:disable Naming/AccessorMethodName
    def get_factory_name
      :recurring_logic
    end
    # rubocop:enable Naming/AccessorMethodName
  end
end
