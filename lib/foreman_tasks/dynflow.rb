require 'dynflow'

module ForemanTasks
  # Class for configuring and preparing the Dynflow runtime environment.
  class Dynflow
    require 'foreman_tasks/dynflow/configuration'
    require 'foreman_tasks/dynflow/persistence'
    require 'foreman_tasks/dynflow/daemon'

    def initialize
      @required = false
    end

    def config
      @config ||= ForemanTasks::Dynflow::Configuration.new
    end

    # call this method if your engine uses Dynflow
    def require!
      @required = true
    end

    def required?
      @required
    end

    def initialized?
      !@world.nil?
    end

    def initialize!
      return unless @required
      return @world if @world

      if config.lazy_initialization && defined?(PhusionPassenger)
        config.dynflow_logger.warn("ForemanTasks: lazy loading with PhusionPassenger might lead to unexpected results")
      end
      config.initialize_world.tap do |world|
        @world = world

        unless config.remote?
          at_exit { world.terminate.wait }

          # for now, we can check the consistency only when there
          # is no remote executor. We should be able to check the consistency
          # every time the new world is created when there is a register
          # of executors
          world.consistency_check
        end
      end
    end

    # Mark that the process is executor. This prevents the remote setting from
    # applying. Needs to be set up before the world is being initialized
    def executor!
      @executor = true
    end

    def executor?
      @executor
    end

    def reinitialize!
      @world = nil
      self.initialize!
    end

    def world
      return @world if @world

      initialize! if config.lazy_initialization
      unless @world
        raise 'The Dynflow world was not initialized yet. '\
              'If your plugin uses it, make sure to call ForemanTasks.dynflow.require! '\
              'in some initializer'
      end

      return @world
    end

    def web_console
      ::Dynflow::WebConsole.setup do
        before do
          if !Setting[:dynflow_enable_console]
            redirect('dashboard')
          end
        end

        set(:world) { ForemanTasks.dynflow.world }
      end
    end

    def eager_load_actions!
      config.eager_load_paths.each do |load_path|
        Dir.glob("#{load_path}/**/*.rb").sort.each do |file|
          unless loaded_paths.include?(file)
            require_dependency file
            loaded_paths << file
          end
        end
      end
      @world.reload! if @world
    end

    def loaded_paths
      @loaded_paths ||= Set.new
    end
  end
end
