class MigrateNonExclusiveLocksToLinks < ActiveRecord::Migration[5.0]
  def up
    ForemanTasks::Lock.where(:exclusive => false).find_in_batches do |group|
      group.each do |lock|
        params = { :task_id => lock.task_id,
                   :resource_type => lock.resource_type,
                   :resource_id => lock.resource_id }
        ForemanTasks::Link.new(params).save! unless ForemanTasks::Link.where(params).any?
      end
    end
  end

  def down
    # raise ActiveRecord::IrreversibleMigration
  end
end
