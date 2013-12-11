class CreateForemanTasksLocks < ActiveRecord::Migration
  def change
    create_table :foreman_tasks_locks do |t|
      t.string :task_id, index: true, null: false
      t.string :name, index: true, null: false
      t.string :resource_type, index: true
      t.integer :resource_id
      t.boolean :exclusive, index: true
    end
    add_index :foreman_tasks_locks, [:resource_type, :resource_id]
  end
end
