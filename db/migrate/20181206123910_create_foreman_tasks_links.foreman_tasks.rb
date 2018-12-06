class CreateForemanTasksLinks < ActiveRecord::Migration[4.2]
  def change
    create_table :foreman_tasks_links do |t|
      task_id_options = { :index => true, :null => true }
      if on_postgresql?
        t.uuid :task_id, task_id_options
      else
        t.string :task_id, task_id_options
      end
      # TODO: Figure out if we need this
      # t.string :name, index: true, null: false
      t.string :resource_type
      t.integer :resource_id
    end
    add_index :foreman_tasks_links, [:resource_type, :resource_id]
    add_index :foreman_tasks_links, [:task_id, :resource_type, :resource_id],
              :unique => true, :name => 'foreman_tasks_links_unique_index'
  end

  private

  def on_postgresql?
    ActiveRecord::Base.connection.adapter_name == 'PostgreSQL'
  end
end
