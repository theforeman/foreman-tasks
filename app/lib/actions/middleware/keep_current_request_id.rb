module Actions
  module Middleware
    class KeepCurrentRequestID < Dynflow::Middleware
      def delay(*args)
        pass(*args).tap { store_current_request_id }
      end

      def plan(*args)
        with_current_request_id do
          pass(*args).tap { store_current_request_id }
        end
      end

      def run(*args)
        restore_current_request_id { pass(*args) }
      end

      def finalize
        restore_current_request_id { pass }
      end

      # Run all execution plan lifecycle hooks as the original request_id
      def hook(*args)
        restore_current_request_id { pass(*args) }
      end

      private

      def with_current_request_id
        if action.input[:current_request_id].nil?
          yield
        else
          restore_current_request_id { yield }
        end
      end

      def store_current_request_id
        action.input[:current_request_id] = ::Logging.mdc['request']
      end

      def restore_current_request_id
        if (restored_id = action.input[:current_request_id]).present?
          old_id = ::Logging.mdc['request']
          if old_id.present? && old_id != restored_id
            action.action_logger.warn(_('Changing request id %{request_id} to saved id %{saved_id}') % { :saved_id => restored_id, :request_id => old_id })
          end
          ::Logging.mdc['request'] = restored_id
        end
        yield
      ensure
        # Reset to original request id only when not nil
        # Otherwise, keep the id until it's cleaned in  Dynflow's run_user_code block
        # so that it will stay valid for the rest of the processing of the current step
        # (even outside of the middleware lifecycle)
        ::Logging.mdc['request'] = old_id if old_id.present?
      end
    end
  end
end
