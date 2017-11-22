class ChangeTasksWidgetNames < ActiveRecord::Migration[4.2]
  def up
    Widget.where(:name => 'Tasks Status table')\
          .update_all(:name => 'Task Status')
    Widget.where(:name => 'Tasks in Error/Warning')\
          .update_all(:name => 'Latest Warning/Error Tasks')
  end

  def down
    Widget.where(:name => 'Task Status')\
          .update_all(:name => 'Tasks Status table')
    Widget.where(:name => 'Latest Warning/Error Tasks')\
          .update_all(:name => 'Tasks in Error/Warning')
  end
end
