require 'fileutils'

module ForemanTasks
  class Dynflow::Daemon
    # load the Rails environment and initialize the executor
    # in this thread.
    def run(foreman_root = Dir.pwd)
      STDERR.puts('Starting Rails environment')
      foreman_env_file = File.expand_path('./config/environment.rb', foreman_root)
      unless File.exist?(foreman_env_file)
        raise "#{foreman_root} doesn't seem to be a foreman root directory"
      end
      ForemanTasks.dynflow.executor!
      require foreman_env_file
      STDERR.puts('Everything ready')
      sleep
    ensure
      STDERR.puts('Exiting')
    end

    # run the executor as a daemon
    def run_background(command = 'start', options = {})
      default_options = { foreman_root: Dir.pwd,
                          process_name: 'dynflow_executor',
                          pid_dir: "#{Rails.root}/tmp/pids",
                          log_dir: File.join(Rails.root, 'log'),
                          wait_attempts: 300,
                          wait_sleep: 1,
                          executors_count: (ENV['EXECUTORS_COUNT'] || 1).to_i }
      options = default_options.merge(options)
      FileUtils.mkdir_p(options[:pid_dir])
      begin
        require 'daemons'
      rescue LoadError
        raise "You need to add gem 'daemons' to your Gemfile if you wish to use it."
      end

      unless %w(start stop restart run).include?(command)
        raise "Command exptected to be 'start', 'stop', 'restart', 'run', was #{command.inspect}"
      end

      STDERR.puts("Dynflow Executor: #{command} in progress")

      options[:executors_count].times do
        Daemons.run_proc(options[:process_name],
                         :multiple => true,
                         :dir => options[:pid_dir],
                         :log_dir => options[:log_dir],
                         :dir_mode => :normal,
                         :monitor => true,
                         :log_output => true,
                         :log_output_syslog => true,
                         :ARGV => [command]) do |*_args|
          begin
            ::Logging.reopen
            run(options[:foreman_root])
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
  end
end
