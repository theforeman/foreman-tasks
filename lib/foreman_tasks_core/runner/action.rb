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
        when Runner::ExternalEvent
          process_external_event(event)
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

      def process_external_event(event)
        runner_dispatcher.external_event(output[:runner_id], event)
        suspend
      end

      def process_update(update)
        merge_outputs(update.continuous_output.raw_outputs, update.incremental)
        if update.exit_status
          finish_run(update)
        else
          suspend
        end
      end

      def merge_outputs(outputs, incremental)
        # No need to do anything if there are no inputs or if the "new" outputs are older than the already saved ones
        return if outputs.empty? || (!output[:result].empty? && outputs.first['timestamp'] < output[:result].last['timestamp'])
        unless incremental
          # The new output is complete, we need to remove the already known outputs from it
          # Also since it's complete output, there's only one
          new = outputs.first
          known = output[:result].select { |out| out['timestamp'] < outputs.first['timestamp'] }
                                 .map { |out| out['output'] }.join
          new['output'].gsub!(/\A#{known}/, '')
        end
        output[:result].concat(outputs)
      end

      def failed_run?
        output[:exit_status] != 0
      end
    end
  end
end
