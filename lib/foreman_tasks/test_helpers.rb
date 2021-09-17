require 'dynflow/testing'
module ForemanTasks
  module TestHelpers
    def self.use_in_memory_sqlite!
      raise 'the in thread world have already been initialized' if @test_in_thread_world
      @use_in_memory_sqlite = true
    end

    def self.test_in_thread_world
      return @test_in_thread_world if @test_in_thread_world
      world_config = ForemanTasks.dynflow.config.world_config
      if @use_in_memory_sqlite
        world_config.persistence_adapter = lambda do |*_args|
          ::Dynflow::PersistenceAdapters::Sequel.new('adapter' => 'sqlite', 'database' => ':memory:')
        end
      end
      @test_in_thread_world = ::Dynflow::Testing::InThreadWorld.new(world_config)
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
