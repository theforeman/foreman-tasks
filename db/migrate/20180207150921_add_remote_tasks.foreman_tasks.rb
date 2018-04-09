class AddRemoteTasks < ActiveRecord::Migration[5.0]
  def change
    create_table :foreman_tasks_remote_tasks do |t|
      t.string :execution_plan_id, :null => false
      t.integer :step_id, :null => false
      t.string :state, :null => false, :default => 'new'

      t.string :proxy_url, :null => false
      t.string :remote_task_id

      t.index :execution_plan_id
      t.index [:execution_plan_id, :step_id], :name => 'index_foreman_tasks_plan_id_and_step_id'

      t.datetime :created_at, default: -> { 'CURRENT_TIMESTAMP' }
    end
  end
end
