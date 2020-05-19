class DropDynflowAllowDangerousActionsSetting < ActiveRecord::Migration[6.0]
  def up
    Setting.where(name: 'dynflow_allow_dangerous_actions').delete_all
  end
end
