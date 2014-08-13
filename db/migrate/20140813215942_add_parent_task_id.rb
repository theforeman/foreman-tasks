class AddParentTaskId < ActiveRecord::Migration
  def change
    add_column :foreman_tasks_tasks, :parent_task_id, :string, index: true
  end
end
