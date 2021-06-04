module Types
  class Task < Types::BaseObject
    description 'A Task'
    model_class ::ForemanTasks::Task

    global_id_field :id
    field :type, String
    field :label, String
    field :started_at, GraphQL::Types::ISO8601DateTime
    field :ended_at, GraphQL::Types::ISO8601DateTime
    field :state, String
    field :result, String
    field :external_id, String
    field :parent_task_id, String
    field :start_at, GraphQL::Types::ISO8601DateTime
    field :start_before, GraphQL::Types::ISO8601DateTime
    field :action, String
    field :user_id, Integer
    field :state_updated_at, GraphQL::Types::ISO8601DateTime

    def self.graphql_definition
      super.tap { |type| type.instance_variable_set(:@name, 'ForemanTasks::Task') }
    end
  end
end
