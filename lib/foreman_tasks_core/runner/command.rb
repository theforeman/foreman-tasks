module ForemanTasksCore
  module Runner
    module Command
      def initialize_command(*command)
        @command_out, @command_in, @command_pid = PTY.spawn(*command)
      rescue Errno::ENOENT => e
        publish_exception("Error running command '#{command.join(' ')}'", e)
      end

      def refresh
        return if @command_out.nil?
        ready_outputs, * = IO.select([@command_out], nil, nil, 0.1)
        if ready_outputs
          if @command_out.nread > 0
            lines = @command_out.read_nonblock(@command_out.nread)
          else
            close_io
            Process.wait(@command_pid)
            publish_exit_status($CHILD_STATUS.exitstatus)
          end
          publish_data(lines, 'stdout') if lines && !lines.empty?
        end
      end

      def close
        close_io
      end

      private

      def close_io
        @command_out.close if @command_out && !@command_out.closed?
        @command_out = nil

        @command_in.close if @command_in && !@command_in.closed?
        @command_in = nil
      end
    end
  end
end
