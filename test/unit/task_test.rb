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
end
