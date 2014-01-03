require 'foreman_tasks/version'
require 'foreman_tasks/engine'
require 'foreman_tasks/dynflow_configuration'
require 'foreman_tasks/dynflow_persistence'

module ForemanTasks

  def self.dynflow_initialized?
    !@world.nil?
  end

  def self.dynflow_initialize
    return @world if @world
    dynflow_configuration.initialize_world.tap do |world|
      @world = world

      ActionDispatch::Reloader.to_prepare do
        ForemanTasks.eager_load!
        world.reload!
      end

      at_exit { world.terminate.wait }

      # for now, we can check the consistency only when there
      # is no remote executor. We should be able to check the consistency
      # every time the new world is created when there is a register
      # of executors
      world.consistency_check unless dynflow_configuration.remote?
    end
  end

  def self.dynflow_configuration
    @configuration ||= ForemanTasks::DynflowConfiguration.new
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

  def self.async_task(action, *args, &block)
    run = trigger(action, *args, &block)
    ForemanTasks::Task::DynflowTask.find_by_external_id(run.id)
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
