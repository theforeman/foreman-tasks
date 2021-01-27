module ForemanTasks
  module EventSubscribersExtensions
    def all_observable_events
      @all_observable_events ||=
        begin
          actions = ::Dynflow::Action.descendants.select { |klass| klass <= ::Actions::ObservableAction }.map(&:namespaced_event_names)
          (super + actions).flatten.uniq
        end
    end
  end
end
