class CreateForemanTasks < ActiveRecord::Migration
  def change
    create_table :foreman_tasks_tasks, :id => false do |t|
      t.string :uuid, index: true, null: false
      t.string :type, index: true, null: false
      t.string :label, index: true
      t.datetime :started_at, index: true
      t.datetime :ended_at, index: true
      t.string :state, index: true, null: false
      t.string :result, index: true, null: false
      t.decimal :progress, index: true, precision: 5, scale: 4
      t.string :external_id, index: true
    end
  end
end
