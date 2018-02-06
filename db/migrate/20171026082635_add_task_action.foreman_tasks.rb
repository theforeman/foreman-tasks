class AddTaskAction < ActiveRecord::Migration[4.2]
  def up
    add_column :foreman_tasks_tasks, :action, :string
  end

  def down
    remove_column :foreman_tasks_tasks, :action
  end
end
