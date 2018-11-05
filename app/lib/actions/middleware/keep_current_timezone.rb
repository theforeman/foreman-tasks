module Actions
  module Middleware
    class KeepCurrentTimezone < Dynflow::Middleware
      def delay(*args)
        pass(*args).tap { store_current_timezone }
      end

      def plan(*args)
        with_current_timezone do
          pass(*args).tap { store_current_timezone }
        end
      end

      def run(*args)
        restore_curent_timezone { pass(*args) }
      end

      def finalize
        restore_curent_timezone { pass }
      end

      # Run all execution plan lifecycle hooks as the original timezone
      def hook(*args)
        restore_curent_timezone { pass(*args) }
      end

      private

      def with_current_timezone
        if action.input[:current_timezone].nil?
          yield
        else
          restore_curent_timezone { yield }
        end
      end

      def store_current_timezone
        action.input[:current_timezone] = Time.zone.name
      end

      def restore_curent_timezone
        old_zone = Time.zone
        Time.zone = Time.find_zone(action.input[:current_timezone]) if action.input[:current_timezone].present?
        yield
      ensure
        Time.zone = old_zone
      end
    end
  end
end
