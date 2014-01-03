module ForemanTasks
  class World < Dynflow::World
    def initialize
      db_config            = ActiveRecord::Base.configurations[Rails.env]
      db_config['adapter'] = 'postgres' if db_config['adapter'] == 'postgresql'
      db_config['adapter'] = 'sqlite'   if db_config['adapter'] == 'sqlite3'
      world_options        = { logger_adapter:      Dynflow::LoggerAdapters::Delegator.new(Rails.logger, Rails.logger),
                               executor_class:      Dynflow::Executors::Parallel, # TODO configurable Parallel or Remote
                               pool_size:           5,
                               persistence_adapter: ForemanTasks::DynflowPersistence.new(db_config),
                               transaction_adapter: Dynflow::TransactionAdapters::ActiveRecord.new }
      super(world_options)
      world = self
      ActionDispatch::Reloader.to_prepare do
        ForemanTasks.eager_load!
        world.reload!
      end
      at_exit { world.terminate.wait }
    end
  end
end
