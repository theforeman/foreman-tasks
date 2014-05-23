require 'dynflow'

module ForemanTasks
  # Class for configuring and preparing the Dynflow runtime environment.
  class EmptyDynflow

    # call this method if your engine uses Dynflow
    def require!
      ForemanTasks.dynflow.require!
    end

    def required?
      ForemanTasks.dynflow.required?
    end

    def initialized?
      !@world.nil?
    end

    def initialize!
      return unless required?
      return @world if @world

      @world = ::Dynflow::SimpleWorld.new
    end

    def reinitialize!
      shutdown!
      initialize!
    end

    def shutdown!
      @world = nil
    end

    def world
      return @world if @world

      initialize!
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
        set(:world) { ForemanTasks.viewer.world }
      end
    end

  end
end
