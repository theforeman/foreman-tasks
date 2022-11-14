require 'foreman_tasks_test_helper'

class TasksTest < ActiveSupport::TestCase
  describe 'search' do
    describe 'by current user' do
      before do
        @original_current_user = User.current
        @user_one = FactoryBot.create(:user)
        @user_two = FactoryBot.create(:user)

        @task_one = FactoryBot.create(:some_task, :user => @user_one)
        FactoryBot.create(:some_task, :user => @user_two)

        User.current = @user_one
      end
      after { User.current = @original_current_user }

      test 'can search the tasks by current_user' do
        assert_equal [@task_one], ForemanTasks::Task.search_for('owner.id = current_user')
      end

      test 'can search by implicit search' do
        assert_equal [@task_one], ForemanTasks::Task.search_for(@task_one.label)
      end

      test 'can search the tasks by current_user in combination with implicit search' do
        assert_equal [@task_one], ForemanTasks::Task.search_for("owner.id = current_user AND #{@task_one.label}")
      end

      test 'can search the tasks by user' do
        assert_equal [@task_one], ForemanTasks::Task.search_for("user = #{@user_one.login}")
      end

      it 'cannot search by arbitrary key' do
        _(proc { ForemanTasks::Task.search_for('user.my_key ~ 5') }).must_raise(ScopedSearch::QueryNotSupported)
        _(proc { ForemanTasks::Task.search_for('user. = 5') }).must_raise(ScopedSearch::QueryNotSupported)
      end

      test 'can search the tasks by negated user' do
        assert_equal [@task_one], ForemanTasks::Task.search_for("user != #{@user_two.login}")
        assert_equal [@task_one], ForemanTasks::Task.search_for("user <> #{@user_two.login}")
        SecureRandom.stubs(:hex).returns('abc')
        assert_equal ForemanTasks::Task.search_for("user != #{@user_two.login}").to_sql,
                     ForemanTasks::Task.search_for("user <> #{@user_two.login}").to_sql
      end

      test 'can search the tasks by user\'s id' do
        assert_equal [@task_one], ForemanTasks::Task.search_for("user.id = #{@user_one.id}")
        assert_equal [@task_one], ForemanTasks::Task.search_for("owner.id = #{@user_one.id}")
        assert_equal [@task_one], ForemanTasks::Task.search_for("user.id != #{@user_two.id}")
        assert_equal [@task_one], ForemanTasks::Task.search_for("owner.id != #{@user_two.id}")
      end

      test 'can search by array of user ids' do
        assert_equal [@task_one], ForemanTasks::Task.search_for("user.id ^ (#{@user_one.id})")
        assert_equal [@task_one], ForemanTasks::Task.search_for("owner.id ^ (#{@user_one.id})")
        assert_equal [@task_one], ForemanTasks::Task.search_for("user.id !^ (#{@user_two.id})")
        assert_equal [@task_one], ForemanTasks::Task.search_for("owner.id !^ (#{@user_two.id})")
      end

      test 'cannot glob on user\'s id' do
        _(proc { ForemanTasks::Task.search_for("user.id ~ something") }).must_raise(ScopedSearch::QueryNotSupported)
        _(proc { ForemanTasks::Task.search_for("user.id ~ 5") }).must_raise(ScopedSearch::QueryNotSupported)
      end

      test 'can search the tasks by user with wildcards' do
        part = @user_one.login[1..-1] # search for '*ser1' if login is 'user1'
        # The following two should be equivalent
        assert_equal [@task_one], ForemanTasks::Task.search_for("user ~ #{part}")
        assert_equal [@task_one], ForemanTasks::Task.search_for("user ~ *#{part}*")
        SecureRandom.stubs(:hex).returns('abc')
        assert_equal ForemanTasks::Task.search_for("user ~ #{part}").to_sql,
                     ForemanTasks::Task.search_for("user ~ *#{part}*").to_sql
      end

      test 'can search the tasks by user with negated wildcards' do
        part = @user_two.login[1..-1] # search for '*ser1' if login is 'user1'
        # The following two should be equivalent
        assert_equal [@task_one], ForemanTasks::Task.search_for("user !~ #{part}")
        assert_equal [@task_one], ForemanTasks::Task.search_for("user !~ *#{part}*")
        SecureRandom.stubs(:hex).returns('abc')
        assert_equal ForemanTasks::Task.search_for("user !~ #{part}").to_sql,
                     ForemanTasks::Task.search_for("user !~ *#{part}*").to_sql
      end

      test 'can search the tasks by array' do
        assert_equal [@task_one], ForemanTasks::Task.search_for("user ^ (this_user, #{@user_one.login}, that_user)")
      end

      test 'can search the tasks by negated array' do
        assert_equal [@task_one], ForemanTasks::Task.search_for("user !^ (this_user, #{@user_two.login}, that_user)")
      end

      test 'properly returns username' do
        assert_equal @task_one.username, @user_one.login
      end
    end

    describe 'by duration' do
      before do
        @task_one, @task_two = FactoryBot.create_list(:dynflow_task, 2).sort_by(&:id)
      end

      let(:scope) { ForemanTasks::Task.order(:id) }

      it 'can search by seconds ' do
        skip unless on_postgresql?
        _(scope.search_for('duration < 2')).must_be :empty?
        _(scope.search_for('duration = 2')).must_equal [@task_one, @task_two]
        _(scope.search_for('duration < "2 seconds"')).must_be :empty?
        _(scope.search_for('duration > "2 seconds"')).must_be :empty?
        _(scope.search_for('duration = "2 seconds"')).must_equal [@task_one, @task_two]
        _(scope.search_for('duration <= "2 seconds"')).must_equal [@task_one, @task_two]
        _(scope.search_for('duration >= "2 seconds"')).must_equal [@task_one, @task_two]
      end

      it 'can search by other time intervals' do
        skip unless on_postgresql?
        %w[minutes hours days months years].each do |interval|
          _(scope.search_for("duration < \"2 #{interval}\"")).must_equal [@task_one, @task_two]
          _(scope.search_for("duration > \"2 #{interval}\"")).must_be :empty?
          _(scope.search_for("duration = \"2 #{interval}\"")).must_be :empty?
          _(scope.search_for("duration <= \"2 #{interval}\"")).must_equal [@task_one, @task_two]
          _(scope.search_for("duration >= \"2 #{interval}\"")).must_be :empty?
        end
      end

      it 'raises an exception if duration is unknown' do
        _(proc { ForemanTasks::Task.search_for('duration = "25 potatoes"') }).must_raise ScopedSearch::QueryNotSupported
      end
    end

    context 'by taxonomies' do
      test 'can search by taxonomies using IN' do
        assert_nothing_raised { ForemanTasks::Task.search_for('location_id ^ (1)').first }
        assert_nothing_raised { ForemanTasks::Task.search_for('organization_id ^ (1)').first }
        assert_nothing_raised { ForemanTasks::Task.search_for('location_id ^ (1,2)').first }
        assert_nothing_raised { ForemanTasks::Task.search_for('organization_id ^ (1,2)').first }
        assert_nothing_raised { ForemanTasks::Task.search_for('organization_id = 1').first }
      end
    end
  end

  describe 'users' do
    test 'users can be deleted even if they have tasks assigned' do
      user = FactoryBot.create(:user)
      FactoryBot.create(:some_task, :user => user)
      user.destroy!
    end
  end

  describe 'state_updated_at' do
    it 'updates the state_updated_at when the state changes' do
      task = FactoryBot.create(:some_task)
      assert task.state_updated_at > Time.now.utc - 1.minute, "Newly created task has to have state_updated_at set"
      task.update(state_updated_at: nil)
      task.result = 'error'
      task.save
      assert_not task.state_updated_at, "Other than state change should not affect 'state_updated_at'"
      task.state = 'running'
      task.save
      assert task.state_updated_at, "State change should set 'state_updated_at'"
    end
  end

  describe 'authorization filtering' do
    it 'can filter by the task subject' do
      user_role  = FactoryBot.create(:user_user_role)
      user       = user_role.owner
      role       = user_role.role
      permission = FactoryBot.build(:permission)
      permission.resource_type = 'ForemanTasks::Task'
      permission.save!
      FactoryBot.create(:filter, :role => role, :permissions => [permission])

      User.current = user
      task = FactoryBot.create(:dynflow_task)

      auth = Authorizer.new(user)
      assert auth.can?(permission.name.to_sym, task)
    end
  end

  describe 'consistency check' do
    it 'ensures the tasks marked as running are really running in Dynflow' do
      task = ForemanTasks.sync_task(Support::DummyDynflowAction)
      task.update(:state => 'running') # Updating state updates the timestamp
      task.update(:state_updated_at => Time.zone.now - 5.minutes)

      ForemanTasks::Task::DynflowTask.consistency_check
      task.reload
      _(task.state).must_equal 'stopped'
    end
  end

  describe 'active job task' do
    it 'when scheduled to the future, the label and action is set properly' do
      job = Support::DummyActiveJob.set(:wait => 12.hours).perform_later
      task = ForemanTasks::Task.find_by!(:external_id => job.provider_job_id)
      _(task.action).must_equal "Dummy action"
      _(task.label).must_equal "Support::DummyActiveJob"
    end
  end

  describe 'task without valid execution plan' do
    let(:missing_task_uuid) { '11111111-2222-3333-4444-555555555555' }

    let(:task) do
      task = FactoryBot.create(:dynflow_task).tap do |task|
        task.external_id = missing_task_uuid
        task.save
      end
      ForemanTasks::Task.find(task.id)
    end

    it 'handles the error while loading the task and does not propagate errors unless necessary' do
      task.cancellable?
      task.resumable?
      task.main_action
      assert_equal 'Support::DummyDynflowAction', task.get_humanized(:humanized_name)
      assert_equal 0, task.progress
      assert_raises(KeyError) { task.cancel }
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
        :pending   => 0,
      }
    end
    let(:task) { FactoryBot.create(:dynflow_task) }

    describe 'without sub tasks' do
      it 'calculates the progress report correctly' do
        _(task.sub_tasks_counts).must_equal result_base
      end
    end

    describe 'with sub tasks' do
      let(:failed) { FactoryBot.create(:dynflow_task).tap { |t| t.result = :error } }
      let(:success) { FactoryBot.create(:dynflow_task).tap { |t| t.result = :success } }
      before { task.sub_tasks = [success, failed] }

      it 'calculate the progress report correctly' do
        expected_result = result_base.merge(:success => 1, :error => 1, :total => 2)
        _(task.sub_tasks_counts).must_equal expected_result
      end

      it 'calculates the progress report correctly when using batch planning' do
        result_base = self.result_base.merge(:success => 1, :error => 1, :total => 25)
        fake_action = OpenStruct.new(:total_count => 25)
        task.stubs(:main_action).returns(fake_action)

        task.state = 'stopped'
        expected_result = result_base.merge(:cancelled => 23)
        _(task.sub_tasks_counts).must_equal expected_result

        task.state = 'pending'
        expected_result = result_base.merge(:pending => 23)
        _(task.sub_tasks_counts).must_equal expected_result
      end
    end
  end

  describe 'recurring task' do
    let(:logic) { FactoryBot.build(:recurring_logic) }
    let(:task) { FactoryBot.create(:dynflow_task) }

    it 'can indicate it is recurring' do
      assert_not task.recurring?
      task.add_missing_task_groups(logic.task_group)
      task.reload
      assert task.recurring?
    end
  end

  describe 'delayed task' do
    let(:task) { FactoryBot.create(:some_task) }

    it 'can indicate it is delayed' do
      assert_not task.delayed?
      _(task.execution_type).must_equal 'Immediate'
      task.start_at = Time.now.utc + 100
      assert task.delayed?
      _(task.execution_type).must_equal 'Delayed'
    end
  end

  describe 'search for resource_ids' do
    label = 'label1'
    resource_ids = [1, 2]
    resource_type = 'restype1'

    let(:task1_old) do
      FactoryBot.create(
        :task_with_links,
        started_at: '2019-10-01 11:15:55',
        ended_at: '2019-10-01 11:15:57',
        resource_id: 1,
        label: label,
        resource_type: resource_type
      )
    end
    let(:task1_new) do
      FactoryBot.create(
        :task_with_links,
        started_at: '2019-10-02 11:15:55',
        ended_at: '2019-10-02 11:15:57',
        resource_id: 1,
        label: label,
        resource_type: resource_type
      )
    end
    let(:task2) do
      FactoryBot.create(
        :task_with_links,
        started_at: '2019-10-03 11:15:55',
        ended_at: '2019-10-03 11:15:57',
        resource_id: 2,
        label: label,
        resource_type: resource_type
      )
    end
    let(:task3) do
      FactoryBot.create(
        :task_with_links,
        started_at: '2019-10-03 11:15:55',
        ended_at: '2019-10-03 11:15:57',
        resource_id: 3,
        label: label,
        resource_type: 'another_type'
      )
    end

    it 'finds tasks' do
      task1_old
      task1_new
      task2
      task3

      result = ForemanTasks::Task.search_for(
        "resource_id ^ (#{resource_ids.join(',')}) and resource_type = #{resource_type}"
      ).distinct
      assert_equal 3, result.length
      assert_includes result, task1_old
      assert_includes result, task1_new
      assert_includes result, task2
      assert_not_includes result, task3
    end

    it 'finds latest task for each resource_id' do
      task1_old
      task1_new
      task2
      task3

      result = ForemanTasks::Task.latest_tasks_by_resource_ids(
        label,
        resource_type,
        resource_ids
      )
      assert_equal 2, result.length
      assert_equal resource_ids, result.keys.sort
      assert_equal task1_new, result[1]
      assert_equal task2, result[2]
      assert_not_includes result.values, task3
    end
  end
end
