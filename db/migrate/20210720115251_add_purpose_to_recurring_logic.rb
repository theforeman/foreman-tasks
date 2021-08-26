class AddPurposeToRecurringLogic < ActiveRecord::Migration[6.0]
  def change
    add_column :foreman_tasks_recurring_logics, :purpose, :string
    add_index :foreman_tasks_recurring_logics, :purpose, unique: true, where: "state IN ('active', 'disabled')"
  end
end
