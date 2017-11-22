class AddTaskTypeValueIndex < ActiveRecord::Migration[4.2]
  def change
    add_index :foreman_tasks_tasks, [:type, :label]
  end
end
