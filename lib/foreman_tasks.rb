require 'foreman_tasks/version'
require 'foreman_tasks/engine'
require 'foreman_tasks/world'
require 'foreman_tasks/dynflow_persistence'

module ForemanTasks

  def self.dynflow_initialized?
    !@world.nil?
  end

  def self.dynflow_initialize
    return if @world
    db_config            = ActiveRecord::Base.configurations[Rails.env]
    db_config['adapter'] = 'postgres' if db_config['adapter'] == 'postgresql'
    world_options        = {
        logger_adapter:      Dynflow::LoggerAdapters::Delegator.new(Logging.logger['action'],
                                                                    Logging.logger['dynflow']),
        executor_class:      Dynflow::Executors::Parallel, # TODO configurable Parallel or Remote
        pool_size:           5,
        persistence_adapter: ForemanTasks::DynflowPersistence.new(db_config),
        transaction_adapter: Dynflow::TransactionAdapters::ActiveRecord.new }

    @world = ForemanTasks::World.new(world_options).tap do |world|
      ActionDispatch::Reloader.to_prepare do
        ForemanTasks.eager_load!
        world.reload!
      end
      at_exit { @world.terminate! }
    end
  end

  def self.world
    if @world
      return @world
    else
      raise "The Dynflow world was not initialized yet. "\
            "If your plugin uses it, make sure to call ForemanTasks.dynflow_initialize "\
            "in after_initialize block"
    end
  end

  def self.trigger(action, *args, &block)
    world.trigger action, *args, &block
  end

  def self.eager_load_paths
    @eager_load_paths ||= []
  end

  def self.eager_load!
    eager_load_paths.each do |load_path|
      # todo: does the reloading work now?x
      Dir.glob("#{load_path}/**/*.rb").sort.each do |file|
        require_dependency file
      end
    end
  end
end
