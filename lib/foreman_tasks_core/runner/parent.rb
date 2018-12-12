module ForemanTasksCore
  module Runner
    class Parent < Base
      # targets = { identifier => { :execution_plan_id => "...", :run_step_id => id,
      #                           :input => { ... } }
      def initialize(targets = {}, suspended_action: nil)
        @targets = targets
        @exit_statuses = {}
        super suspended_action: suspended_action
      end

      def generate_updates
        @outputs.reduce({}) do |acc, (key, value)|
          if value.empty? && @exit_status.nil?
            acc
          else
            identifier = key
            @outputs[identifier] = ForemanTasksCore::ContinuousOutput.new
            key = host_action(identifier) unless identifier == @suspended_action
            exit_status = @exit_statuses[identifier] || @exit_status if @exit_status
            acc.merge(key => Runner::Update.new(value, exit_status))
          end
        end
      end

      def initialize_continuous_outputs
        @outputs = ([@suspended_action] + @targets.keys).reduce({}) do |acc, target|
          acc.merge(target => ForemanTasksCore::ContinuousOutput.new)
        end
      end

      def host_action(identifier)
        options = @targets[identifier].slice('execution_plan_id', 'run_step_id')
                                      .merge(:world => ForemanTasksCore.dynflow_world)
        Dynflow::Action::Suspended.new OpenStruct.new(options)
      end

      def broadcast_data(data, type)
        @outputs.each { |_k, output| output.add_output(data, type) }
      end

      def publish_data(data, type)
        @outputs[@suspended_action].add_output(data, type)
      end

      def publish_data_for(identifier, data, type)
        @outputs[identifier].add_output(data, type)
      end

      def dispatch_exception(context, exception)
        @outputs.values.each { |output| output.add_exception(context, exception) }
      end

      def publish_exit_status_for(identifier, exit_status)
        @exit_statuses[identifier] = exit_status
      end
    end
  end
end
