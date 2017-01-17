module Actions
  module Helpers
    module ArgsSerialization
      class Builder
        def initialize(*objects)
          @hash = {}.with_indifferent_access
          objects.each do |object|
            add_object(object)
          end
        end

        def to_h
          @hash
        end

        private

        def add_object(object)
          case object
          when ForemanTasks::Concerns::ActionSubject
            add(object.action_input_key, object_to_value(object))
          when Hash
            add_hash(object_to_value(object))
          else
            raise "don't know how to serialize #{object.inspect}"
          end
        end

        def object_to_value(object)
          case object
          when Array
            object.map { |item| object_to_value(item) }
          when Hash
            object.reduce({}) do |new_hash, (key, value)|
              new_hash.update(key => object_to_value(value))
            end
          when ForemanTasks::Concerns::ActionSubject
            object.to_action_input
          when String, Numeric, true, false, nil, Dynflow::ExecutionPlan::OutputReference
            object
          else
            object.to_s
          end
        end

        def add_hash(hash)
          hash.each { |key, value| add(key, value) }
        end

        def add(key, value)
          if @hash.key?(key)
            raise KeyError, "Conflict while serializing action args in key #{key}"
          end
          @hash.update(key => value)
        end
      end

      def serialize_args(*objects)
        phase! Dynflow::Action::Plan
        Builder.new(*objects).to_h
      end
    end
  end
end
