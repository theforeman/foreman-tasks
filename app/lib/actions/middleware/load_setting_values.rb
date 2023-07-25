module Actions
  module Middleware
    class LoadSettingValues < ::Dynflow::Middleware
      # ::Actions::Middleware::LoadSettingValues
      #
      # A middleware to ensure we load current setting values

      def delay(*args)
        reload_setting_values
        pass(*args)
      end

      def plan(*args)
        reload_setting_values
        pass(*args)
      end

      def run(*args)
        reload_setting_values
        pass(*args)
      end

      def finalize(*args)
        reload_setting_values
        pass(*args)
      end

      def hook(*args)
        reload_setting_values
        pass(*args)
      end

      private

      def reload_setting_values
        ::Foreman.settings.load_values
      end
    end
  end
end
