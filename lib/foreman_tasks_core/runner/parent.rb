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
        base = {}
        base[@suspended_action] = Runner::Update.new(ForemanTasksCore::ContinuousOutput.new, @exit_status) if @exit_status
        # Operate on all hosts if the main process ended or only on hosts for which we have updates
        @outputs.reject { |_, output| @exit_status.nil? && output.empty? }
                .reduce(base) do |acc, (identifier, output)|
                  @outputs[identifier] = ForemanTasksCore::ContinuousOutput.new # Create a new ContinuousOutput for next round of updates
                  exit_status = @exit_statuses[identifier] || @exit_status if @exit_status
                  acc.merge(host_action(identifier) => Runner::Update.new(output, exit_status))
                end
      end

      def initialize_continuous_outputs
        @outputs = @targets.keys.reduce({}) do |acc, target|
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

      def publish_data(_data, _type)
        true
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
