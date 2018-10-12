module ForemanTasksCore
  module Runner
    class Parent < Base

      # targets = { hostname => { :execution_plan_id => "...", :run_step_id => id,
      #                           :input => { ... } }
      def initialize(targets = {})
        @targets = targets
        super()
      end

      def generate_updates
        @outputs.reduce({}) do |acc, (key, value)|
          if value.empty? && @exit_status.nil?
            acc
          else
            @outputs[key] = ForemanTasksCore::ContinuousOutput.new
            key = host_action(key) unless key == :control
            acc.merge(key => Runner::Update.new(value, @exit_status))
          end
        end
      end

      def initialize_continuous_outputs
        @outputs = ([:control] + @targets.keys).reduce({}) do |acc, target|
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

      def publish_exception(context, exception, fatal = true)
        logger.error("#{context} - #{exception.class} #{exception.message}:\n" + \
                     exception.backtrace.join("\n"))
        @outputs.each { |output| output.add_exception(context, exception) }
        publish_exit_status('EXCEPTION') if fatal
      end
    end
  end
end
