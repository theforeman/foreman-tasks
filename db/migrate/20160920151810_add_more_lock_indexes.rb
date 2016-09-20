class AddMoreLockIndexes < ActiveRecord::Migration
  def change
    add_index(:foreman_tasks_tasks, [:id, :state],
              :name => 'index_foreman_tasks_id_state')
    add_index(:foreman_tasks_locks, [:name, :resource_type, :resource_id],
              :name => 'index_foreman_tasks_locks_name_resource_type_resource_id')
  end
end
