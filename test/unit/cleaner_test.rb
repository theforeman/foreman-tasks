require 'foreman_tasks_test_helper'

class TasksTest < ActiveSupport::TestCase
  before do
    # To stop dynflow from backing up actions, execution_plans and steps
    ForemanTasks.dynflow.world.persistence.adapter.stubs(:backup_to_csv)
    ForemanTasks::Cleaner.any_instance.stubs(:say) # Make the tests silent
    # Hack to make the tests pass due to ActiveRecord shenanigans
    ForemanTasks::Cleaner.any_instance.stubs(:delete_orphaned_dynflow_tasks)
  end

  describe ForemanTasks::Cleaner do
    it 'is able to delete tasks (including the dynflow plans) based on filter' do
      cleaner = ForemanTasks::Cleaner.new(:filter => 'label = "Actions::User::Create"', :after => '10d')

      tasks_to_delete = [FactoryBot.create(:dynflow_task, :user_create_task),
                         FactoryBot.create(:dynflow_task, :user_create_task)]
      tasks_to_keep   = [FactoryBot.create(:dynflow_task, :user_create_task) do |task|
                           task.started_at = task.ended_at = Time.zone.now
                           task.save
                         end,
                         FactoryBot.create(:dynflow_task, :product_create_task)]
      cleaner.expects(:tasks_to_csv)
      cleaner.delete
      assert_empty ForemanTasks::Task.where(id: tasks_to_delete)
      assert_equal tasks_to_keep.map(&:id).sort, ForemanTasks::Task.where(id: tasks_to_keep).order(:id).map(&:id)

      assert_equal 0, ForemanTasks.dynflow.world.persistence
                  .find_execution_plans(filters: { 'uuid' => tasks_to_delete.map(&:external_id) }).size

      assert_equal tasks_to_keep.size, ForemanTasks.dynflow.world.persistence
                  .find_execution_plans(filters: { 'uuid' => tasks_to_keep.map(&:external_id) }).size
    end

    describe "#orphaned_dynflow_tasks" do
      # We can't use transactional tests because we're using Sequel for the cleanup query
      self.use_transactional_tests = false
      before do
        skip "Sqlite is running testing Dynlfow DB in memory" if ActiveRecord::Base.connection.adapter_name == 'SQLite'
        @existing_task = FactoryBot.create(:dynflow_task, :user_create_task)
        @missing_task = FactoryBot.create(:dynflow_task, :user_create_task)
        @cleaner = ForemanTasks::Cleaner.new(filter: "id ^ (#{@existing_task.id}, #{@missing_task.id})")
        @missing_task.destroy
      end

      after do
        @cleaner.delete if @cleaner
      end

      it 'is able to find orphaned execution plans (without corresponding task object)' do
        assert(@cleaner.orphaned_dynflow_tasks.any? { |t| t[:uuid] == @missing_task.external_id })
        assert_not(@cleaner.orphaned_dynflow_tasks.any? { |t| t[:uuid] == @existing_task.external_id })
      end
    end

    it 'deletes all tasks matching the filter when the time limit is not specified' do
      cleaner = ForemanTasks::Cleaner.new(:filter => 'label = "Actions::User::Create"')
      tasks_to_delete = [FactoryBot.create(:dynflow_task, :user_create_task),
                         FactoryBot.create(:dynflow_task, :user_create_task) do |task|
                           task.started_at = task.ended_at = Time.zone.now
                           task.save
                         end]
      link_to_delete = tasks_to_delete.first.links.create(:resource => User.current)

      tasks_to_keep = [FactoryBot.create(:dynflow_task, :product_create_task)]
      link_to_keep = tasks_to_keep.first.links.create(:resource => User.current)

      cleaner.expects(:tasks_to_csv)
      cleaner.delete
      assert_empty ForemanTasks::Task.where(id: tasks_to_delete)
      assert_equal tasks_to_keep, ForemanTasks::Task.where(id: tasks_to_keep)

      assert_nil ForemanTasks::Link.find_by(id: link_to_delete.id)
      refute_nil ForemanTasks::Link.find_by(id: link_to_keep.id)
    end

    it 'supports passing empty filter (just delete all)' do
      cleaner = ForemanTasks::Cleaner.new(:filter => '', :after => '10d')
      tasks_to_delete = [FactoryBot.create(:dynflow_task, :user_create_task),
                         FactoryBot.create(:dynflow_task, :product_create_task)]

      tasks_to_keep = [FactoryBot.create(:dynflow_task, :user_create_task) do |task|
                         task.started_at = task.ended_at = Time.zone.now
                         task.save
                       end]
      cleaner.expects(:tasks_to_csv)
      cleaner.delete
      assert_empty ForemanTasks::Task.where(id: tasks_to_delete)
      assert_equal tasks_to_keep, ForemanTasks::Task.where(id: tasks_to_keep)
    end

    it 'matches tasks with compound filters properly' do
      cleaner = ForemanTasks::Cleaner.new(:filter => 'result = pending or result = error',
                                          :states => %w[paused planning])
      tasks_to_delete = [FactoryBot.create(:some_task),
                         FactoryBot.create(:some_task)]
      tasks_to_delete[0].update!(:result => 'error', :state => 'paused')
      tasks_to_delete[1].update!(:result => 'pending', :state => 'planning')
      task_to_keep = FactoryBot.create(:some_task)
      task_to_keep.update!(:result => 'pending', :state => 'planned')
      cleaner.expects(:tasks_to_csv)
      cleaner.delete
      assert_empty ForemanTasks::Task.where(id: tasks_to_delete)
      assert_equal [task_to_keep], ForemanTasks::Task.where(id: task_to_keep)
    end

    it 'backs tasks up before deleting' do
      dir = '/tmp'
      cleaner = ForemanTasks::Cleaner.new(:filter => '', :after => '10d', :backup_dir => dir)
      tasks_to_delete = [FactoryBot.create(:dynflow_task, :user_create_task),
                         FactoryBot.create(:dynflow_task, :product_create_task)]

      r, w = IO.pipe
      cleaner.expects(:with_backup_file)
             .with(dir, 'foreman_tasks.csv')
             .yields(w, false)
      cleaner.delete
      w.close
      header, *data = r.readlines.map(&:chomp)
      assert_equal ForemanTasks::Task.attribute_names.join(','), header
      expected_lines = tasks_to_delete.map { |task| task.attributes.values.to_csv.chomp }
      assert_equal expected_lines.count, data.count
      expected_lines.each { |line| assert_includes data, line }
      assert_empty ForemanTasks::Task.where(id: tasks_to_delete)
    end

    class ActionWithCleanup < Actions::Base
      def self.cleanup_after
        '15d'
      end
    end

    describe 'default behaviour' do
      it 'searches for the actions that have the cleanup_after defined' do
        ForemanTasks::Cleaner.stubs(:cleanup_settings => {})
        actions = ForemanTasks::Cleaner.actions_with_default_cleanup
        example = actions.find { |rule| rule.klass == ActionWithCleanup }
        assert_equal '15d', example.after
      end

      it 'searches for the actions that have the cleanup_after defined' do
        ForemanTasks::Cleaner.stubs(:cleanup_settings =>
                                     { :actions => [{ :name => ActionWithCleanup.name, :after => '5d' }] })
        actions = ForemanTasks::Cleaner.actions_with_default_cleanup
        example = actions.find { |rule| rule.klass == ActionWithCleanup }
        assert_equal '5d', example.after
      end

      it 'generates filters from rules properly' do
        actions_with_default = ForemanTasks::CompositeActionRule.new(
          ForemanTasks::ActionRule.new('action1', nil),
          ForemanTasks::ActionRule.new('action2', nil)
        )
        rules = [{ :after => nil },
                 { :after => '10d', :filter => 'label = something', :states => %w[stopped paused] },
                 { :after => '15d', :filter => 'label = something_else',
                   :override_actions => true, :states => 'all' }]
        ForemanTasks::Cleaner.stubs(:cleanup_settings).returns(:rules => rules)
        r1, r2 = ForemanTasks::Cleaner.actions_by_rules actions_with_default
        assert_equal '(NOT ((label ^ (action1, action2)))) AND (label = something)', r1[:filter]
        assert_equal %w[stopped paused], r1[:states]
        assert_equal '(label = something_else)', r2[:filter]
        assert_equal [], r2[:states]
      end
    end
  end
end
