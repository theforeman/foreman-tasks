class DropAllLocks < ActiveRecord::Migration[5.0]
  BATCH_SIZE = 10_000

  def up
    ForemanTasks::Lock.limit(BATCH_SIZE).delete_all while ForemanTasks::Lock.any?
  end

  def down
    # raise ActiveRecord::IrreversibleMigration
  end
end
