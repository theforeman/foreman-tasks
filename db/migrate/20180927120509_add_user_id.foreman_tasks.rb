class AddUserId < ActiveRecord::Migration[5.0]
  def up
    add_reference :foreman_tasks_tasks, :user, :foreign_key => true

    return if User.unscoped.find_by_login(User::ANONYMOUS_ADMIN).nil?
    User.as_anonymous_admin do
      user_locks.select(:resource_id).distinct.pluck(:resource_id).each do |owner_id|
        tasks = ForemanTasks::Task.joins(:locks).where(:locks => user_locks.where(:resource_id => owner_id))
        tasks.update_all(:user_id => owner_id)
        user_locks.where(:resource_id => owner_id).delete_all
      end
    end
  end

  def down
    User.as_anonymous_admin do
      ForemanTasks::Task.select(:user_id).distinct.pluck(:user_id).compact.each do |user_id|
        ForemanTasks::Task.where(:user_id => user_id).select(:id).find_in_batches do |group|
          group.each { |task| create_lock user_id, task } # TODO: Bulk insert would be nice
        end
      end
    end

    remove_column :foreman_tasks_tasks, :user_id
  end

  private

  def create_lock(user_id, task)
    ForemanTasks::Lock.new(:name          => ForemanTasks::Lock::OWNER_LOCK_NAME,
                           :resource_type => User.name,
                           :resource_id   => user_id,
                           :task_id       => task.id,
                           :exclusive     => false).save!
  end

  def user_locks
    ForemanTasks::Lock.where(:name => ForemanTasks::Lock::OWNER_LOCK_NAME)
  end
end
