require 'test_helper'
require_relative './support/dummy_dynflow_action'
require_relative './support/dummy_proxy_action'

require 'dynflow/testing'

FactoryBot.definition_file_paths = ["#{ForemanTasks::Engine.root}/test/factories"]
FactoryBot.find_definitions

ForemanTasks.dynflow.require!
ForemanTasks.dynflow.config.disable_active_record_actions = true
