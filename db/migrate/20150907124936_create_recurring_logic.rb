class CreateRecurringLogic < ActiveRecord::Migration
  def change
    create_table :foreman_tasks_recurring_logics do |t|
      t.string :cron_line, :null => false
      t.datetime :end_time
      t.integer :max_iteration
      t.integer :iteration, :default => 0
      t.integer :task_group_id, :index => true, :null => false
    end
  end
end
