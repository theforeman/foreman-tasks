class AddTaskAction < ActiveRecord::Migration
  def up
    add_column :foreman_tasks_tasks, :action, :string

    ::ForemanTasks::Task.where(:action => nil).find_each do |task|
      task.action = task.format_input
      task.save!
    end
  end

  def down
    remove_column :foreman_tasks_tasks, :action
  end
end
