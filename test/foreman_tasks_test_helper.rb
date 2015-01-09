require 'test_helper'
require_relative './support/dummy_dynflow_action'

FactoryGirl.definition_file_paths = ["#{ForemanTasks::Engine.root}/test/factories"]
FactoryGirl.find_definitions

ForemanTasks.dynflow.require!
ForemanTasks.dynflow.config.disable_active_record_actions = true
