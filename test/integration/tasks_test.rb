# frozen_string_literal: true

require_relative '../test_plugin_helper'
require 'integration_test_helper'

class TasksIntegrationTest < IntegrationTestWithJavascript
  test 'does not allow user without permissions to see task details' do
    setup_user('view', 'foreman_tasks', 'owner.id = current_user')
    task = FactoryBot.create(:some_task)
    set_request_user(User.current)

    visit "/foreman_tasks/tasks/#{task.id}"
    wait_for_ajax

    assert_selector 'h5', text: /Task not found/i
    assert_no_selector '#task-details-tabs'
  end
end
