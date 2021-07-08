class AddParentTaskIdToRemoteTasks < ActiveRecord::Migration[5.0]
  def change
    add_column :foreman_tasks_remote_tasks, :parent_task_id, :string
  end
end
