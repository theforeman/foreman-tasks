class AddParentTaskId < ActiveRecord::Migration[4.2]
  def change
    add_column :foreman_tasks_tasks, :parent_task_id, :string, index: true
  end
end
