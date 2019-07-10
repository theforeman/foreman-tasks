class DropOldLocks < ActiveRecord::Migration[5.0]
  BATCH_SIZE = 10_000

  # Delete all locks which are exclusive or have a stopped task or are orphaned
  def up
    scope = ForemanTasks::Lock.left_outer_joins(:task)
    scope = scope.where(:exclusive => false)
                 .or(scope.where("#{ForemanTasks::Task.table_name}.state" => ['stopped', nil]))
    scope.limit(BATCH_SIZE).delete_all while scope.any?
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
