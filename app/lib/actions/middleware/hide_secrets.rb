module Actions
  module Middleware
    class HideSecrets < ::Dynflow::Middleware
      def present
        action.input[:secrets]  = 'Secrets hidden' if action.input.key?(:secrets)
        action.output[:secrets] = 'Secrets hidden' if action.output.key?(:secrets)
      end
    end
  end
end
