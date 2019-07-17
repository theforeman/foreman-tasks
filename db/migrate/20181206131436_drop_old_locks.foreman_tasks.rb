class DropOldLocks < ActiveRecord::Migration[5.0]
  BATCH_SIZE = 10_000

  # Delete all locks which are exclusive or have a stopped task or are orphaned
  def up
    scope = ForemanTasks::Lock.left_outer_joins(:task)
    scope = scope.where(:exclusive => false)
                 .or(scope.where("#{ForemanTasks::Task.table_name}.state" => ['stopped', nil]))
    scope.limit(BATCH_SIZE).delete_all while scope.any?

    # For each group of locks, where each lock has the same task_id, resource_type and resource_id
    # return the highest id within the group, if there is more than 1 lock in the group
    scope = ForemanTasks::Lock.select("MAX(id) as id")
                              .group(:task_id, :resource_type, :resource_id)
                              .having("count(*) > 1")

    # Make sure there is at most one lock per task and resource
    ForemanTasks::Lock.where(:id => scope.limit(BATCH_SIZE)).delete_all while scope.any?
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
