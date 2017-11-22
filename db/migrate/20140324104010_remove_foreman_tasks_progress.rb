class RemoveForemanTasksProgress < ActiveRecord::Migration[4.2]
  def change
    remove_column :foreman_tasks_tasks, :progress
  end
end
