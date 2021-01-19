module ForemanTasks
  module EventSubscribersExtensions
    def all_observable_events
      @all_observable_events ||=
        begin
          actions = ::Dynflow::Action.descendants.select { |klass| klass <= ::Actions::ObservableAction }.map(&:event_name)
          (super + actions).flatten.uniq
        end
    end
  end
end
