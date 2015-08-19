module Actions
  module Serializers

    class ActiveRecordSerializer < ::Dynflow::Serializers::Noop
      def serialize(arg)
        if arg.is_a? ActiveRecord::Base
          { :active_record_object => true,
            :class_name => arg.class.name,
            :id => arg.id }
        else
          super arg
        end
      end

      def deserialize(arg)
        if arg.is_a?(Hash) && arg[:active_record_object]
          arg[:class_name].constantize.find(arg[:id])
        else
          super arg
        end
      end
    end

  end
end

