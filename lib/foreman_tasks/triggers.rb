module ForemanTasks
  module Triggers
    # for test overrides if needed
    attr_writer :foreman_tasks
    def foreman_tasks
      @foreman_tasks ||= ForemanTasks
    end

    def trigger(action, *args, &block)
      foreman_tasks.dynflow.world.trigger action, *args, &block
    end

    def trigger_task(async, action, *args, &block)
      foreman_tasks.trigger_task(async, action, *args, &block)
    end

    def async_task(action, *args, &block)
      foreman_tasks.async_task(action, *args, &block)
    end

    def sync_task(action, *args, &block)
      foreman_tasks.sync_task(action, *args, &block)
    end
  end
end
