class AddTaskTypeValueIndex < ActiveRecord::Migration
  def change
     add_index :foreman_tasks_tasks, [:type, :label]
  end
end
