module Types
  class Triggering < Types::BaseObject
    description 'A Task Triggering'
    model_class ::ForemanTasks::Triggering

    global_id_field :id
    field :mode, String
    field :start_at, GraphQL::Types::ISO8601DateTime
    field :start_before, GraphQL::Types::ISO8601DateTime
    field :recurring_logic, Types::RecurringLogic

    def self.graphql_definition
      super.tap { |type| type.instance_variable_set(:@name, 'ForemanTasks::Triggering') }
    end
  end
end
