require 'foreman_tasks_test_helper'

class TasksTest < ActiveSupport::TestCase
  describe 'filtering by current user' do
    before { @original_current_user = User.current }
    after  { User.current = @original_current_user }

    test "can search the tasks by current_user" do
      user_one = FactoryGirl.create(:user)
      user_two = FactoryGirl.create(:user)

      task_one = FactoryGirl.create(:some_task, :set_owner => user_one)
      task_two = FactoryGirl.create(:some_task, :set_owner => user_two)

      User.current = user_one
      assert_equal [task_one], ForemanTasks::Task.search_for("owner.id = current_user")
    end
  end

  describe 'task with multiple locks on the same resource_type' do
    setup do
      @user = FactoryGirl.create(:user)
      task = FactoryGirl.create(:some_task, :set_owner => @user)
      task.locks.first.dup.save!
    end

    test 'searching on resource_type does not return duplicates' do
      assert_equal 1, ForemanTasks::Task.search_for("resource_type = User").count
    end

    test 'searching on resource_type and id does not return duplicates' do
      assert_equal 1, ForemanTasks::Task.search_for("resource_type = User and resource_id = #{@user.id}").count
    end

    test 'only find correct task when searching on resource_type and resource_id' do
      task_two = FactoryGirl.create(:some_task, :set_owner => @user)
      lock = task_two.locks.first
      lock.resource_type = 'Host'
      lock.save!
      assert_equal 2, ForemanTasks::Task.search_for("resource_id = #{@user.id}").count
      assert_equal 1, ForemanTasks::Task.search_for("resource_type = User and resource_id = #{@user.id}").count
    end
  end

  describe 'authorization filtering' do
    it 'can filter by the task subject' do
      user_role  = FactoryGirl.create(:user_user_role)
      user       = user_role.owner
      role       = user_role.role
      permission = FactoryGirl.build(:permission)
      permission.resource_type = 'ForemanTasks::Task'
      permission.save!
      FactoryGirl.create(:filter, :role => role, :permissions => [permission])

      User.current = user
      task = FactoryGirl.create(:dynflow_task)

      auth       = Authorizer.new(user)
      assert auth.can?(permission.name.to_sym, task)
    end
  end

  describe 'consistency check' do

    let(:consistent_task) { FactoryGirl.create(:dynflow_task, :sync_with_dynflow => true) }
    let(:inconsistent_task) { FactoryGirl.create(:dynflow_task, :inconsistent_dynflow_task) }

    it 'ensures the tasks marked as running are really running in Dynflow' do
      running_task_count = ForemanTasks::Task::DynflowTask.running.count
      consistent_task.state.must_equal 'planned'
      inconsistent_task.state.must_equal 'running'

      fixed_count = ForemanTasks::Task::DynflowTask.consistency_check

      fixed_count.must_equal running_task_count + 1
      consistent_task.reload.state.must_equal 'planned'
      inconsistent_task.reload.state.must_equal 'planned'
    end
  end
end
