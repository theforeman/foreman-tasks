require 'fileutils'
require 'daemons'
require 'get_process_mem'
require 'dynflow/watchers/memory_consumption_watcher'

module ForemanTasks
  class Dynflow::Daemon
    attr_reader :dynflow_memory_watcher_class,
                :daemons_class

    # make Daemon dependency injection ready for testing purposes
    def initialize(
      dynflow_memory_watcher_class = ::Dynflow::Watchers::MemoryConsumptionWatcher,
      daemons_class = ::Daemons
    )
      @dynflow_memory_watcher_class = dynflow_memory_watcher_class
      @daemons_class = daemons_class
    end

    # load the Rails environment and initialize the executor
    # in this thread.
    def run(foreman_root = Dir.pwd, options = {})
      STDERR.puts('Starting Rails environment')
      foreman_env_file = File.expand_path('./config/environment.rb', foreman_root)
      unless File.exist?(foreman_env_file)
        raise "#{foreman_root} doesn't seem to be a foreman root directory"
      end

      STDERR.puts("Starting dynflow with the following options: #{options}")

      ForemanTasks.dynflow.executor!

      if options[:memory_limit].to_i > 0
        ForemanTasks.dynflow.config.on_init do |world|
          memory_watcher = initialize_memory_watcher(world, options[:memory_limit], options)
          world.terminated.on_completion do
            STDERR.puts("World has been terminated")
            memory_watcher = nil # the object can be disposed
          end
        end
      end

      require foreman_env_file
      STDERR.puts("Everything ready for world: #{(ForemanTasks.dynflow.initialized? ? ForemanTasks.dynflow.world.id : nil)}")
      sleep
    ensure
      STDERR.puts('Exiting')
    end

    # run the executor as a daemon
    def run_background(command = 'start', options = {})
      options = default_options.merge(options)
      FileUtils.mkdir_p(options[:pid_dir])
      begin
        require 'daemons'
      rescue LoadError
        raise "You need to add gem 'daemons' to your Gemfile if you wish to use it."
      end

      unless %w[start stop restart run].include?(command)
        raise "Command exptected to be 'start', 'stop', 'restart', 'run', was #{command.inspect}"
      end

      STDERR.puts("Dynflow Executor: #{command} in progress")

      options[:executors_count].times do
        daemons_class.run_proc(
          options[:process_name],
          daemons_options(command, options)
        ) do |*_args|
          begin
            ::Logging.reopen
            run(options[:foreman_root], options)
          rescue => e
            STDERR.puts e.message
            Foreman::Logging.exception('Failed running foreman-tasks daemon', e)
            exit 1
          end
        end
      end
    end

    protected

    def world
      ForemanTasks.dynflow.world
    end

    private

    def daemons_options(command, options)
      {
        :multiple => true,
        :dir => options[:pid_dir],
        :log_dir => options[:log_dir],
        :dir_mode => :normal,
        :monitor => true,
        :log_output => true,
        :log_output_syslog => true,
        :monitor_interval => [options[:memory_polling_interval] / 2, 30].min,
        :ARGV => [command]
      }
    end

    def default_options
      {
        foreman_root: Dir.pwd,
        process_name: 'dynflow_executor',
        pid_dir: "#{Rails.root}/tmp/pids",
        log_dir: File.join(Rails.root, 'log'),
        wait_attempts: 300,
        wait_sleep: 1,
        executors_count: (ENV['EXECUTORS_COUNT'] || 1).to_i,
        memory_limit: begin
                        (ENV['EXECUTOR_MEMORY_LIMIT'] || '').to_gb.gigabytes
                      rescue RuntimeError
                        ENV['EXECUTOR_MEMORY_LIMIT'].to_i
                      end,
        memory_init_delay: (ENV['EXECUTOR_MEMORY_MONITOR_DELAY'] || 7200).to_i, # 2 hours
        memory_polling_interval: (ENV['EXECUTOR_MEMORY_MONITOR_INTERVAL'] || 60).to_i
      }
    end

    def initialize_memory_watcher(world, memory_limit, options)
      watcher_options = {}
      watcher_options[:polling_interval] = options[:memory_polling_interval]
      watcher_options[:initial_wait] = options[:memory_init_delay]
      watcher_options[:memory_checked_callback] = ->(current_memory, memory_limit) { log_memory_within_limit(current_memory, memory_limit) }
      watcher_options[:memory_limit_exceeded_callback] = ->(current_memory, memory_limit) { log_memory_limit_exceeded(current_memory, memory_limit) }
      dynflow_memory_watcher_class.new(world, memory_limit, watcher_options)
    end

    def log_memory_limit_exceeded(current_memory, memory_limit)
      message = "Memory level exceeded, registered #{current_memory} bytes, which is greater than #{memory_limit} limit."
      Foreman::Logging.logger('foreman-tasks').error(message)
    end

    def log_memory_within_limit(current_memory, memory_limit)
      message = "Memory level OK, registered #{current_memory} bytes, which is less than #{memory_limit} limit."
      Foreman::Logging.logger('foreman-tasks').debug(message)
    end
  end
end
