class TasksSettingsToDslCategory < ActiveRecord::Migration[6.0]
  def up
    Setting.where(category: 'Setting::ForemanTasks').update_all(category: 'Setting')
  end
end
