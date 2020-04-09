require 'test_helper'
require_relative './support/dummy_active_job'
require_relative './support/dummy_dynflow_action'
require_relative './support/dummy_recurring_dynflow_action'
require_relative './support/dummy_proxy_action'
require_relative './support/dummy_task_group'
require_relative './support/history_tasks_builder'

require 'dynflow/testing'
require 'foreman_tasks/test_helpers'

FactoryBot.definition_file_paths = ["#{ForemanTasks::Engine.root}/test/factories"]
FactoryBot.find_definitions

ForemanTasks.dynflow.require!
ForemanTasks.dynflow.config.disable_active_record_actions = true

ForemanTasks::TestHelpers.use_in_memory_sqlite!

# waits for the passed block to return non-nil value and reiterates it while getting false
# (till some reasonable timeout). Useful for forcing the tests for some event to occur
def wait_for(waiting_message = 'something to happen')
  30.times do
    ret = yield
    return ret if ret
    sleep 0.3
  end
  raise "waiting for #{waiting_message} was not successful"
end

def on_postgresql?
  ActiveRecord::Base.connection.adapter_name == 'PostgreSQL'
end
