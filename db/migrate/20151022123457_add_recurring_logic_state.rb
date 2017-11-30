class AddRecurringLogicState < ActiveRecord::Migration[4.2]
  def up
    add_column :foreman_tasks_recurring_logics, :state, :string, :index => true
  end

  def down
    remove_column :foreman_tasks_recurring_logics, :state
  end
end
