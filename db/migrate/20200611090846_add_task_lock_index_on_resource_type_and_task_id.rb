class AddTaskLockIndexOnResourceTypeAndTaskId < ActiveRecord::Migration[6.0]
  def change
    add_index :foreman_tasks_locks, [:task_id, :resource_type, :resource_id], name: 'index_tasks_locks_on_task_id_resource_type_and_resource_id'
    # These indexes are not needed as they can be gained from partial index lookups
    remove_index :foreman_tasks_locks, :task_id
    remove_index :foreman_tasks_locks, :name
    remove_index :foreman_tasks_locks, :resource_type
  end
end
