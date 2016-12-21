require 'foreman_tasks_core/shareable_action'
module ForemanTasksCore
  module Runner
    class Action < ::ForemanTasksCore::ShareableAction
      include ::Dynflow::Action::Cancellable

      def run(event = nil)
        case event
        when nil
          init_run
        when Runner::Update
          process_update(event)
        when ::Dynflow::Action::Cancellable::Cancel
          kill_run
        else
          raise "Unexpected event #{event.inspect}"
        end
      rescue => e
        action_logger.error(e)
        process_update(Runner::Update.encode_exception('Proxy error', e))
      end

      def finalize
        # To mark the task as a whole as failed
        error! 'Script execution failed' if failed_run?
      end

      def rescue_strategy_for_self
        ::Dynflow::Action::Rescue::Fail
      end

      def initiate_runner
        raise NotImplementedError
      end

      def init_run
        output[:result] = []
        output[:runner_id] = runner_dispatcher.start(suspended_action, initiate_runner)
        suspend
      end

      def runner_dispatcher
        Runner::Dispatcher.instance
      end

      def kill_run
        runner_dispatcher.kill(output[:runner_id])
        suspend
      end

      def finish_run(update)
        output[:exit_status] = update.exit_status
      end

      def process_update(update)
        output[:result].concat(update.continuous_output.raw_outputs)
        if update.exit_status
          finish_run(update)
        else
          suspend
        end
      end

      def failed_run?
        output[:exit_status] != 0
      end
    end
  end
end
