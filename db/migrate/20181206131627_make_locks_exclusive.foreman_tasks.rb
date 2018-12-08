class MakeLocksExclusive < ActiveRecord::Migration[5.0]
  def up
    change_table :foreman_tasks_locks do |t|
      t.remove :exclusive
      t.remove :name
      t.remove_index [:resource_type, :resource_id]
      t.index [:resource_type, :resource_id], :unique => true
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
