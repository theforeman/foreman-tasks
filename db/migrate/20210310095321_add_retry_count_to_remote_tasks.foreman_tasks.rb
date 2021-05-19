class AddRetryCountToRemoteTasks < ActiveRecord::Migration[6.0]
  def change
    add_column :foreman_tasks_remote_tasks, :retry_count, :integer, default: 0
  end
end
