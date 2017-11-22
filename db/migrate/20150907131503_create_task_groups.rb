class CreateTaskGroups < ActiveRecord::Migration[4.2]
  def up
    create_table :foreman_tasks_task_groups do |t|
      t.string :type, index: true, null: false
    end

    create_table :foreman_tasks_task_group_members do |t|
      t.string :task_id, null: false
      t.integer :task_group_id, null: false
    end

    add_index :foreman_tasks_task_group_members, [:task_id, :task_group_id], unique: true, name: 'foreman_tasks_task_group_members_index'
  end

  def down
    drop_table :foreman_tasks_task_groups
    drop_table :foreman_tasks_task_group_members
  end
end
