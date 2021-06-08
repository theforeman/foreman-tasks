module Actions
  module Middleware
    class LoadSettingValues < ::Dynflow::Middleware
      # ::Actions::Middleware::LoadSettingValues
      #
      # A middleware to ensure we load current setting values

      def delay(*args)
        ::Foreman.settings.load_values
        pass(*args)
      end

      def plan(*args)
        ::Foreman.settings.load_values
        pass(*args)
      end

      def run(*args)
        ::Foreman.settings.load_values
        pass(*args)
      end

      def finalize(*args)
        ::Foreman.settings.load_values
        pass(*args)
      end
    end
  end
end
