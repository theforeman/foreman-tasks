class RemoveForemanTasksProgress < ActiveRecord::Migration
  def change
    remove_column :foreman_tasks_tasks, :progress
  end
end
