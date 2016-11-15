require 'dynflow/testing'
module ForemanTasks
  module TestHelpers
    def self.test_in_thread_world
      world_config = ForemanTasks.dynflow.config.world_config
      @test_in_thread_world ||= ::Dynflow::Testing::InThreadWorld.new(world_config)
    end

    module WithInThreadExecutor
      extend ActiveSupport::Concern
      included do
        setup do
          @old_dynflow_world = ForemanTasks.dynflow.world
          ForemanTasks.dynflow.world = ForemanTasks::TestHelpers.test_in_thread_world
        end

        teardown do
          ForemanTasks.dynflow.world = @old_dynflow_world
        end
      end
    end
  end
end
