class AddRemoteTasks < ActiveRecord::Migration[5.0]
  def change
    create_table :foreman_tasks_remote_tasks do |t|
      t.string :remote_task_id
      t.string :execution_plan_id, :null => false
      t.index :execution_plan_id
      t.integer :step_id, :null => false
      t.string :state, :null => false, :default => 'new'
      t.string :proxy_url, :null => false
    end
  end
end
