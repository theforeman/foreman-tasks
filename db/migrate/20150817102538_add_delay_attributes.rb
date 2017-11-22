class AddDelayAttributes < ActiveRecord::Migration[4.2]
  def change
    add_column :foreman_tasks_tasks, :start_at, :datetime, index: true, default: nil, null: true
    add_column :foreman_tasks_tasks, :start_before, :datetime, index: true, default: nil, null: true
  end
end
