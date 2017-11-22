class CreateTriggerings < ActiveRecord::Migration[4.2]
  def up
    create_table :foreman_tasks_triggerings do |t|
      t.string :mode, null: false
      t.datetime :start_at
      t.datetime :start_before
    end

    change_table :foreman_tasks_recurring_logics do |t|
      t.integer :triggering_id
    end
  end

  def down
    drop_table :foreman_tasks_triggerings
    remove_column :foreman_tasks_recurring_logics, :triggering_id
  end
end
