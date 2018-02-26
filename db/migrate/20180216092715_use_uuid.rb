class UseUuid < ActiveRecord::Migration[5.0]
  # PostgreSQL has a special column type for storing UUIDs.
  # Using this type instead of generic string should lead to having
  #  smaller DB and possibly better overall performance.
  def up
    if on_postgresql?
      change_table :foreman_tasks_tasks do |t|
        t.change :id, :uuid, :using => 'id::uuid'
        t.change :parent_task_id, :uuid, :using => 'parent_task_id::uuid'
      end

      change_table :foreman_tasks_task_group_members do |t|
        t.change :task_id, :uuid, :using => 'task_id::uuid'
      end

      change_table :foreman_tasks_locks do |t|
        t.change :task_id, :uuid, :using => 'task_id::uuid'
      end
    end
  end

  def down
    if on_postgresql?
      change_table :foreman_tasks_tasks do |t|
        t.change :id, :string
        t.change :parent_task_id, :string
      end

      change_table :foreman_tasks_task_group_members do |t|
        t.change :task_id, :string
      end

      change_table :foreman_tasks_locks do |t|
        t.change :task_id, :string
      end
    end
  end

  private

  def on_postgresql?
    ActiveRecord::Base.connection.adapter_name == 'PostgreSQL'
  end
end
