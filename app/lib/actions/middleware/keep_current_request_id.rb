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
          ::Logging.mdc['request'] = restored_id
          if old_id.present? && old_id != restored_id
            action.action_logger.warn(_('Changing request id %{request_id} to saved id %{saved_id}') % { :saved_id => restored_id, :request_id => old_id })
          end
        end
        yield
      ensure
        ::Logging.mdc['request'] = nil
      end
    end
  end
end
