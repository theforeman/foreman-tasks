module ForemanTasks
  module Concerns
    module ActionSubject

      extend ActiveSupport::Concern

      module ClassMethods
        def available_locks
          [:read, :write]
        end
      end

      def action_input_key
        self.class.name.demodulize.underscore
      end

      def to_action_input
        raise 'The resource needs to be saved first' if self.new_record?

        { id: id, name: name }.tap do |hash|
          hash.update(label: label) if self.respond_to? :label
        end
      end

      # @api override to return the objects that relate to this one, usually parent
      # objects, e.g. repository would return product it belongs to, product would return
      # provider etc.
      #
      # It's used to link a task running on top of this resource to it's related objects,
      # so that is't possible to see all the sync tasks for a product etc.
      def related_resources
        []
      end

      # Recursively searches for related resources of this one, avoiding cycles
      def all_related_resources
        mine = Set.new Array(related_resources)

        get_all_related_resources = -> resource do
          resource.is_a?(ActionSubject) ? resource.all_related_resources : []
        end

        mine + mine.reduce(Set.new) { |s, resource| s + get_all_related_resources.(resource) }
      end

    end
  end
end
