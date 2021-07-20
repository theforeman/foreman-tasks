class AddPurposeToRecurringLogic < ActiveRecord::Migration[6.0]
  def change
    add_column :foreman_tasks_recurring_logics, :purpose, :string
  end
end
