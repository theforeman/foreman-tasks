module ForemanTasks
  class Dynflow::Configuration

    # for logging action related info (such as exceptions raised in side
    # the actions' methods
    attr_accessor :action_logger

    # for logging dynflow related info about the progress of the execution etc.
    attr_accessor :dynflow_logger

    # the number of threads in the pool handling the execution
    attr_accessor :pool_size

    # the size of db connection pool
    attr_accessor :db_pool_size

    # set true if the executor runs externally (by default true in procution, othewise false)
    attr_accessor :remote
    alias_method :remote?, :remote

    # if remote set to true, use this path for socket communication
    # between this process and the external executor
    attr_accessor :remote_socket_path

    # what transaction adapater should be used, by default, it uses the ActiveRecord
    # based adapter, expecting ActiveRecord is used as ORM in the application
    attr_accessor :transaction_adapter

    attr_accessor :eager_load_paths

    attr_accessor :lazy_initialization

    # what rake tasks should run their own executor, not depending on the external one
    attr_accessor :rake_tasks_with_executor

    def initialize
      self.action_logger            = Rails.logger
      self.dynflow_logger           = Rails.logger
      self.pool_size                = 5
      self.db_pool_size             = pool_size + 5
      self.remote                   = Rails.env.production?
      self.remote_socket_path       = File.join(Rails.root, "tmp", "sockets", "dynflow_socket")
      self.transaction_adapter      = ::Dynflow::TransactionAdapters::ActiveRecord.new
      self.eager_load_paths         = []
      self.lazy_initialization      = !Rails.env.production?
      self.rake_tasks_with_executor = %w[db:migrate db:seed]

      @on_init = []
    end

    def on_init(&block)
      @on_init << block
    end

    def initialize_world(world_class = ::Dynflow::World)
      world_class.new(world_options).tap do |world|
        @on_init.each { |init| init.call(world) }
      end
    end

    # No matter what config.remote says, when the process is marked as executor,
    # it can't be remote
    def remote?
      !ForemanTasks.dynflow.executor? &&
          !rake_task_with_executor? &&
          @remote
    end

    def rake_task_with_executor?
      return false unless defined?(Rake)

      Rake.application.top_level_tasks.any? do |rake_task|
        rake_tasks_with_executor.include?(rake_task)
      end
    end

    def increase_db_pool_size?
       ForemanTasks.dynflow.required? && !remote? && !Rails.env.test?
    end

    # To avoid pottential timeouts on db connection pool, make sure
    # we have the pool bigger than the thread pool
    def increase_db_pool_size
      if increase_db_pool_size?
        ActiveRecord::Base.connection_pool.disconnect!

        config = ActiveRecord::Base.configurations[Rails.env]
        config['pool'] = db_pool_size if config['pool'].to_i < db_pool_size
        ActiveRecord::Base.establish_connection(config)
      end
    end

    protected

    # generates the options hash consumable by the Dynflow's world
    def world_options
      { logger_adapter:      ::Dynflow::LoggerAdapters::Delegator.new(action_logger, dynflow_logger),
        pool_size:           5,
        persistence_adapter: initialize_persistence,
        transaction_adapter: transaction_adapter,
        executor:            -> world { initialize_executor world } }
    end

    def default_sequel_adapter_options
      db_config            = ActiveRecord::Base.configurations[Rails.env].dup
      db_config['adapter'] = 'postgres' if db_config['adapter'] == 'postgresql'
      db_config['max_connections'] = db_pool_size if increase_db_pool_size?

      if db_config['adapter'] == 'sqlite3'
        db_config['adapter'] = 'sqlite'
        database = db_config['database']
        unless database == ':memory:'
          # We need to create separate database for sqlite
          # to avoid lock conflicts on the database
          db_config['database'] = "#{File.dirname(database)}/dynflow-#{File.basename(database)}"
        end
      end
      return db_config
    end

    def initialize_executor(world)
      if self.remote?
        ::Dynflow::Executors::RemoteViaSocket.new(world, self.remote_socket_path)
      else
        ::Dynflow::Executors::Parallel.new(world, self.pool_size)
      end
    end

    # Sequel adapter based on Rails app database.yml configuration
    def initialize_persistence
      ForemanTasks::Dynflow::Persistence.new(default_sequel_adapter_options)
    end

  end
end
