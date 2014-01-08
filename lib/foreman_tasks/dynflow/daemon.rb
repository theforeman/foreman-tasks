module ForemanTasks
  class Dynflow::Daemon
    def run
      ::Dynflow::Daemon.new(listener, world, lock_file).run
    end

    protected

    def listener
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
