class MigrateNonExclusiveLocksToLinks < ActiveRecord::Migration[5.0]
  def up
    execute <<-SQL
      INSERT INTO foreman_tasks_links(task_id, resource_type, resource_id)
      SELECT DISTINCT locks.task_id, locks.resource_type, locks.resource_id
      FROM foreman_tasks_locks AS locks
      LEFT JOIN foreman_tasks_links AS links
        ON links.task_id = locks.task_id
          AND links.resource_type = locks.resource_type
          AND links.resource_id = locks.resource_id
      WHERE locks.exclusive = FALSE AND links.task_id IS NULL;
    SQL
  end
end
