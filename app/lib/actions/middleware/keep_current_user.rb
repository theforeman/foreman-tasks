module Actions
  module Middleware
    class KeepCurrentUser < Dynflow::Middleware
      def delay(*args)
        pass(*args).tap { store_current_user }
      end

      def plan(*args)
        with_current_user do
          pass(*args).tap { store_current_user }
        end
      end

      def run(*args)
        restore_curent_user { pass(*args) }
      end

      def finalize
        restore_curent_user { pass }
      end

      def finalize_phase(execution_plan, *args)
        restore_curent_user(execution_plan.entry_action) { pass(execution_plan, *args) }
      end

      # Run all execution plan lifecycle hooks as the original user
      def hook(*args)
        restore_curent_user { pass(*args) }
      end

      private

      def with_current_user
        if User.current || action.input[:current_user_id].nil?
          yield
        else
          restore_curent_user { yield }
        end
      end

      def store_current_user
        action.input[:current_user_id] = User.current.try(:id)
      end

      def restore_curent_user(action = self.action)
        old_user = User.current
        User.current = User.unscoped.find(action.input[:current_user_id]) if action.input[:current_user_id].present?
        yield
      ensure
        User.current = old_user
      end
    end
  end
end
