require 'fileutils'

module ForemanTasks
  class Dynflow::Daemon

    # load the Rails environment and initialize the executor and listener
    # in this thread.
    def run(foreman_root = Dir.pwd)
      STDERR.puts("Starting Rails environment")
      foreman_env_file = File.expand_path("./config/environment.rb", foreman_root)
      unless File.exists?(foreman_env_file)
        raise "#{foreman_root} doesn't seem to be a foreman root directory"
      end
      ForemanTasks.dynflow.executor!
      require foreman_env_file
      STDERR.puts("Starting listener")
      daemon = ::Dynflow::Daemon.new(listener, world, lock_file)
      STDERR.puts("Everything ready")
      daemon.run
    end

    # run the executor as a daemon
    def run_background(command = "start", options = {})
      default_options = { foreman_root: Dir.pwd,
                          process_name: 'dynflow_executor',
                          pid_dir: "#{Rails.root}/tmp/pids",
                          wait_attempts: 300,
                          wait_sleep: 1 }
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

      Daemons.run_proc(options[:process_name],
                       :dir => options[:pid_dir],
                       :dir_mode => :normal,
                       :monitor => true,
                       :log_output => true,
                       :ARGV => [command]) do |*args|
        begin
          run(options[:foreman_root])
        rescue => e
          STDERR.puts e.message
          Rails.logger.fatal e
          exit 1
        end
      end
      if command == "start" || command == "restart"
        STDERR.puts('Waiting for the executor to be ready...')
        options[:wait_attempts].times do |i|
          STDERR.print('.')
          if File.exists?(lock_file)
            STDERR.puts('executor started successfully')
            break
          else
            sleep options[:wait_sleep]
          end
        end
      end
    end

    protected

    def listener
      FileUtils.mkdir_p(File.dirname(socket_path))
      ::Dynflow::Listeners::Socket.new(world, socket_path)
    end

    def socket_path
      ForemanTasks.dynflow.config.remote_socket_path
    end

    def lock_file
      File.join(Rails.root, 'tmp', 'dynflow_executor.lock')
    end

    def world
       ForemanTasks.dynflow.world
    end


  end
end
