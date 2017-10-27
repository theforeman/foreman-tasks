class AddTaskAction < ActiveRecord::Migration
  def up
    add_column :foreman_tasks_tasks, :action, :string
  end

  def down
    remove_column :foreman_tasks_tasks, :action
  end
end
