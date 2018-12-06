class DropAllLocks < ActiveRecord::Migration[5.0]
  BATCH_SIZE = 10_000

  def up
    while ForemanTasks::Lock.any?
      ForemanTasks::Lock.limit(BATCH_SIZE).delete_all
    end
  end

  def down
    # raise ActiveRecord::IrreversibleMigration
  end
end
