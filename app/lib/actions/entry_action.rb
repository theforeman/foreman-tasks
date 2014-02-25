module Actions

  class EntryAction < Actions::Base
    include Helpers::ArgsSerialization
    include Helpers::Lock

    # what locks to use on the resource? All by default, can be overriden.
    # It might one or more locks available for the resource. This following
    # special values are supported as well:
    #
    #  * `:all`:        lock all possible operations (all locks defined in resource's
    #                   `available_locks` method. Only tasks that link to the resource are
    #                   allowed while running this task
    #  * `:exclusive`:  same as `:all` + doesn't allow even linking to the resoruce.
    #                   typical example is deleting a container, preventing all actions
    #                   heppening on it's sub-resources (such a system).
    def resource_locks
      :all
    end

    # Performs all that's needed to connect the action to the resource.
    # It converts the resource (and it's relatives defined in +related_resources+
    # to serialized form (using +to_action_input+).
    #
    # It also locks the resource on the actions defined in +resource_locks+ method.
    #
    # The additional args can include more resources and/or a hash
    # with more data describing the action that should appear in the
    # action's input.
    def action_subject(resource, *additional_args) # TODO redo as a middleware
      Type! resource, ForemanTasks::Concerns::ActionSubject
      input.update serialize_args(resource, *resource.all_related_resources, *additional_args)

      if resource.is_a? ActiveRecord::Base
        if resource_locks == :exclusive
          exclusive_lock!(resource)
        else
          lock!(resource, resource_locks)
        end
      end
    end

    def humanized_input
      Helpers::Humanizer.new(self).input
    end

    def humanized_name
      _(super)
    end

    def self.all_action_names
      subclasses.map { |k| k.allocate.humanized_name }
    end

  end
end
