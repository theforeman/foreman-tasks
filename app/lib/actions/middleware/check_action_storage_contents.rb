module Actions
  module Middleware
    class CheckActionStorageContents < ::Dynflow::Middleware
      def delay(*args)
        check_storage_contents(*args)
      end

      def plan(*args)
        check_storage_contents(*args)
      end

      def run(*args)
        check_storage_contents(*args)
      end

      def finalize(*args)
        check_storage_contents(*args)
      end

      private

      def check_storage_contents(*args)
        output = begin
                   action.output
                 rescue
                   {}
                 end
        pass(*args).tap do
          data = { input: action.input, output: output }
          [:input, :output].each do |key|
            walk(data[key], key.to_s)
          end
        end
      end

      def walk(source, path)
        case source
        # rubocop:disable Style/RedundantReturn
        when String, NilClass, FalseClass, TrueClass, Integer, Float, Time, Dynflow::ExecutionPlan::OutputReference
          return
        # rubocop:enable Style/RedundantReturn
        when Array
          source.each_with_index do |e, idx|
            walk(e, path + "[#{idx}]")
          end
        when Hash
          source.each do |k, v|
            walk(k, path + ".#{k} (key)")
            walk(v, path + ".#{k}")
          end
        else
          action.action_logger.warn("Plan #{action.execution_plan_id}, action #{action.id}: #{path} is of unexpected type #{source.class}")
        end
      end
    end
  end
end
