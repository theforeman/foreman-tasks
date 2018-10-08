class AddRemoteTaskOperation < ActiveRecord::Migration[5.0]
  def change
    add_column :foreman_tasks_remote_tasks, :operation, :string
  end
end
