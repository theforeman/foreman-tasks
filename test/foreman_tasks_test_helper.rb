require 'test_helper'
require_relative './support/dummy_active_job'
require_relative './support/dummy_dynflow_action'
require_relative './support/dummy_recurring_dynflow_action'
require_relative './support/dummy_proxy_action'
require_relative './support/dummy_task_group'

require 'dynflow/testing'

FactoryBot.definition_file_paths = ["#{ForemanTasks::Engine.root}/test/factories"]
FactoryBot.find_definitions

ForemanTasks.dynflow.require!
ForemanTasks.dynflow.config.disable_active_record_actions = true
