class AddTaskLockIndexOnResourceTypeAndTaskId < ActiveRecord::Migration[5.2]
  def change
    add_index :foreman_tasks_locks, [:task_id, :resource_type, :resource_id], name: 'index_tasks_locks_on_task_id_resource_type_and_resource_id'
    # These indexes are not needed as they can be gained from partial index lookups
    [:task_id, :name, :resource_type].each do |index|
      remove_index :foreman_tasks_locks, index if index_exists?(:foreman_tasks_locks, index)
    end
  end
end
