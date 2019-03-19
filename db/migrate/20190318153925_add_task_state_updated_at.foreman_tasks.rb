class AddTaskStateUpdatedAt < ActiveRecord::Migration[5.2]
  def change
    add_column :foreman_tasks_tasks, :state_updated_at, :timestamp, index: true
  end
end
