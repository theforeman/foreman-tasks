require 'foreman_tasks_test_helper'

class TasksTest < ActiveSupport::TestCase
  describe 'filtering by current user' do
    before { @original_current_user = User.current }
    after  { User.current = @original_current_user }

    test 'can search the tasks by current_user' do
      user_one = FactoryGirl.create(:user)
      user_two = FactoryGirl.create(:user)

      task_one = FactoryGirl.create(:some_task, :set_owner => user_one)
      FactoryGirl.create(:some_task, :set_owner => user_two)

      User.current = user_one
      assert_equal [task_one], ForemanTasks::Task.search_for('owner.id = current_user')
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

      auth = Authorizer.new(user)
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

  describe 'subtask count querying' do
    let(:result_base) do
      {
        :error     => 0,
        :warning   => 0,
        :total     => 0,
        :success   => 0,
        :cancelled => 0,
        :pending   => 0
      }
    end
    let(:task) { FactoryGirl.create(:dynflow_task) }

    describe 'without sub tasks' do
      it 'calculates the progress report correctly' do
        task.sub_tasks_counts.must_equal result_base
      end
    end

    describe 'with sub tasks' do
      let(:failed) { FactoryGirl.create(:dynflow_task).tap { |t| t.result = :error } }
      let(:success) { FactoryGirl.create(:dynflow_task).tap { |t| t.result = :success } }
      before { task.sub_tasks = [success, failed] }

      it 'calculate the progress report correctly' do
        expected_result = result_base.merge(:success => 1, :error => 1, :total => 2)
        task.sub_tasks_counts.must_equal expected_result
      end

      it 'calculates the progress report correctly when using batch planning' do
        result_base = result_base.merge(:success => 1, :error => 1, :total => 25)
        fake_action = OpenStruct.new(:total_count => 25)
        task.stubs(:main_action).returns(fake_action)

        task.state = 'stopped'
        expected_result = result_base.merge(:cancelled => 23)
        task.sub_tasks_counts.must_equal expected_result

        task.state = 'pending'
        expected_result = result_base.merge(:pending => 23)
        task.sub_tasks_counts.must_equal expected_result
      end
    end

  end
end
