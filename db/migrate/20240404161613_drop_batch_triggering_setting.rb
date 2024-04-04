class DropBatchTriggeringSetting < ActiveRecord::Migration[6.0]
  def up
    Setting.where(name: 'foreman_tasks_proxy_batch_trigger').delete_all
  end
end
