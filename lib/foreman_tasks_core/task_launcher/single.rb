module ForemanTasksCore
  module TaskLauncher
    class Single < Abstract

      # { :action_class => "MyActionClass", :action_input => {} }
      def launch!(input)
        triggered = trigger(options[:parent],
                            action_class(input),
                            with_callback(input.fetch('action_input', {})))
        @results = format_result(triggered)
      end
    end
  end
end
