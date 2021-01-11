class MakeLocksExclusive < ActiveRecord::Migration[5.0]
  BATCH_SIZE = 2

  def up
    change_table :foreman_tasks_locks do |t|
      t.remove :exclusive
      t.remove :name
      t.remove_index :name => 'index_foreman_tasks_locks_on_resource_type_and_resource_id'
      t.index [:resource_type, :resource_id], :unique => true
    end
  end

  def down
    change_table :foreman_tasks_locks do |t|
      t.boolean :exclusive, index: true
      t.string :name, index: true
      t.remove_index :name => 'index_foreman_tasks_locks_on_resource_type_and_resource_id'
      t.index [:resource_type, :resource_id]
    end

    scope = ForemanTasks::Lock.where(:name => nil)
    while scope.limit(BATCH_SIZE).update_all(:name => 'lock') == BATCH_SIZE; end
    change_column_null(:foreman_tasks_locks, :name, false)
  end
end
