module Types
  class RecurringLogic < Types::BaseObject
    description 'A Recurring Logic'
    model_class ::ForemanTasks::RecurringLogic

    global_id_field :id
    field :cron_line, String
    field :end_time, GraphQL::Types::ISO8601DateTime
    field :max_iteration, Integer
    field :iteration, Integer
    field :state, String
    field :purpose, String
    belongs_to :triggering, Types::Triggering

    def self.graphql_definition
      super.tap { |type| type.instance_variable_set(:@name, 'ForemanTasks::RecurringLogic') }
    end
  end
end
