module ForemanTasksCore
  module Runner
    class Parent < Base
      # targets = { hostname => { :execution_plan_id => "...", :run_step_id => id,
      #                           :input => { ... } }
      def initialize(targets = {}, suspended_action: nil)
        @targets = targets
        super suspended_action: suspended_action
      end

      def generate_updates
        @outputs.reduce({}) do |acc, (key, value)|
          if value.empty? && @exit_status.nil?
            acc
          else
            @outputs[key] = ForemanTasksCore::ContinuousOutput.new
            key = host_action(key) unless key == @suspended_action
            acc.merge(key => Runner::Update.new(value, @exit_status))
          end
        end
      end

      def initialize_continuous_outputs
        @outputs = ([@suspended_action] + @targets.keys).reduce({}) do |acc, target|
          acc.merge(target => ForemanTasksCore::ContinuousOutput.new)
        end
      end

      def host_action(hostname)
        options = @targets[hostname].slice('execution_plan_id', 'run_step_id')
                                    .merge(:world => ForemanTasksCore.dynflow_world)
        Dynflow::Action::Suspended.new OpenStruct.new(options)
      end

      def broadcast_data(data, type)
        @outputs.each { |_k, output| output.add_output(data, type) }
      end

      def publish_data_for(hostname, data, type)
        @outputs[hostname].add_output(data, type)
      end

      def dispatch_exception(context, exception)
        @outputs.values.each { |output| output.add_exception(context, exception) }
      end
    end
  end
end
