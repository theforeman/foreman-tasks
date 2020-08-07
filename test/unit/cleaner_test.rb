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
      _(ForemanTasks::Task.where(id: tasks_to_delete)).must_be_empty
      _(ForemanTasks::Task.where(id: tasks_to_keep).order(:id).map(&:id)).must_equal tasks_to_keep.map(&:id).sort

      _(ForemanTasks.dynflow.world.persistence
                  .find_execution_plans(filters: { 'uuid' => tasks_to_delete.map(&:external_id) }).size).must_equal 0

      _(ForemanTasks.dynflow.world.persistence
                  .find_execution_plans(filters: { 'uuid' => tasks_to_keep.map(&:external_id) }).size).must_equal tasks_to_keep.size
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
      lock_to_delete = tasks_to_delete.first.locks.create(:name => 'read', :resource => User.current)

      tasks_to_keep = [FactoryBot.create(:dynflow_task, :product_create_task)]
      lock_to_keep = tasks_to_keep.first.locks.create(:name => 'read', :resource => User.current)

      cleaner.expects(:tasks_to_csv)
      cleaner.delete
      _(ForemanTasks::Task.where(id: tasks_to_delete)).must_be_empty
      _(ForemanTasks::Task.where(id: tasks_to_keep)).must_equal tasks_to_keep

      _(ForemanTasks::Lock.find_by(id: lock_to_delete.id)).must_be_nil
      _(ForemanTasks::Lock.find_by(id: lock_to_keep.id)).wont_be_nil
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
      _(ForemanTasks::Task.where(id: tasks_to_delete)).must_be_empty
      _(ForemanTasks::Task.where(id: tasks_to_keep)).must_equal tasks_to_keep
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
      _(ForemanTasks::Task.where(id: tasks_to_delete)).must_be_empty
      _(ForemanTasks::Task.where(id: task_to_keep)).must_equal [task_to_keep]
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
      _(header).must_equal ForemanTasks::Task.attribute_names.join(',')
      expected_lines = tasks_to_delete.map { |task| task.attributes.values.to_csv.chomp }
      _(data.count).must_equal expected_lines.count
      expected_lines.each { |line| _(data).must_include line }
      _(ForemanTasks::Task.where(id: tasks_to_delete)).must_be_empty
    end

    class ActionWithCleanup < Actions::Base
      def self.cleanup_after
        '15d'
      end
    end

    describe 'default behaviour' do
      it 'searches for the actions that have the cleanup_after defined' do
        ForemanTasks::Cleaner.stubs(:cleanup_settings => {})
        _(ForemanTasks::Cleaner.actions_with_default_cleanup[ActionWithCleanup]).must_equal '15d'
      end

      it 'searches for the actions that have the cleanup_after defined' do
        ForemanTasks::Cleaner.stubs(:cleanup_settings =>
                                     { :actions => [{ :name => ActionWithCleanup.name, :after => '5d' }] })
        _(ForemanTasks::Cleaner.actions_with_default_cleanup[ActionWithCleanup]).must_equal '5d'
      end

      it 'deprecates the usage of :after' do
        Foreman::Deprecation.expects(:deprecation_warning)
        ForemanTasks::Cleaner.any_instance.expects(:delete)
        ForemanTasks::Cleaner.stubs(:cleanup_settings =>
                                    { :after => '1d' })
        ForemanTasks::Cleaner.stubs(:actions_with_default_cleanup).returns({})
        ForemanTasks::Cleaner.run({})
      end

      it 'generates filters from rules properly' do
        actions_with_default = { 'action1' => nil, 'action2' => nil }
        rules = [{ :after => nil },
                 { :after => '10d', :filter => 'label = something', :states => %w[stopped paused] },
                 { :after => '15d', :filter => 'label = something_else',
                   :override_actions => true, :states => 'all' }]
        ForemanTasks::Cleaner.stubs(:cleanup_settings).returns(:rules => rules)
        r1, r2 = ForemanTasks::Cleaner.actions_by_rules actions_with_default
        _(r1[:filter]).must_equal '(label !^ (action1, action2)) AND (label = something)'
        _(r1[:states]).must_equal %w[stopped paused]
        _(r2[:filter]).must_equal '(label = something_else)'
        _(r2[:states]).must_equal []
      end
    end
  end
end
