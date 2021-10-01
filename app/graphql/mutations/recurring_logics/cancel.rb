module Mutations
  module RecurringLogics
    class Cancel < BaseMutation
      graphql_name 'CancelRecurringLogic'
      description 'Cancels recurring logic and all its active tasks'
      resource_class ::ForemanTasks::RecurringLogic

      argument :id, ID, required: true

      field :errors, [Types::AttributeError], null: false
      field :recurring_logic, Types::RecurringLogic, null: true

      def resolve(id:)
        recurring_logic = load_object_by(id: id)
        authorize!(recurring_logic, :edit)
        task_errors = []
        begin
          recurring_logic.cancel
        rescue => e
          task_errors = [{ path: ['tasks'], message: "There has been an error when canceling one of the tasks: #{e}" }]
        end
        errors = recurring_logic.errors.any? ? map_errors_to_path(recurring_logic) : []
        { recurring_logic: recurring_logic, errors: (errors + task_errors) }
      end
    end
  end
end
