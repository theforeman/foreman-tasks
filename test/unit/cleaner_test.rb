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
      ForemanTasks::Task.where(id: tasks_to_delete).must_be_empty
      ForemanTasks::Task.where(id: tasks_to_keep).order(:id).map(&:id).must_equal tasks_to_keep.map(&:id).sort

      ForemanTasks.dynflow.world.persistence
                  .find_execution_plans(filters: { 'uuid' => tasks_to_delete.map(&:external_id) }).size.must_equal 0

      ForemanTasks.dynflow.world.persistence
                  .find_execution_plans(filters: { 'uuid' => tasks_to_keep.map(&:external_id) }).size.must_equal tasks_to_keep.size
    end

    it 'deletes all tasks matching the filter when the time limit is not specified' do
      cleaner = ForemanTasks::Cleaner.new(:filter => 'label = "Actions::User::Create"')
      tasks_to_delete = [FactoryBot.create(:dynflow_task, :user_create_task),
                         FactoryBot.create(:dynflow_task, :user_create_task) do |task|
                           task.started_at = task.ended_at = Time.zone.now
                           task.save
                         end]
      lock_to_delete = tasks_to_delete.first.locks.create(:name => 'read',:resource => User.current)

      tasks_to_keep   = [FactoryBot.create(:dynflow_task, :product_create_task)]
      lock_to_keep = tasks_to_keep.first.locks.create(:name => 'read',:resource => User.current)

      cleaner.expects(:tasks_to_csv)
      cleaner.delete
      ForemanTasks::Task.where(id: tasks_to_delete).must_be_empty
      ForemanTasks::Task.where(id: tasks_to_keep).must_equal tasks_to_keep

      ForemanTasks::Lock.find_by_id(lock_to_delete.id).must_be_nil
      ForemanTasks::Lock.find_by_id(lock_to_keep.id).wont_be_nil
    end

    it 'supports passing empty filter (just delete all)' do
      cleaner = ForemanTasks::Cleaner.new(:filter => '', :after => '10d')
      tasks_to_delete = [FactoryBot.create(:dynflow_task, :user_create_task),
                         FactoryBot.create(:dynflow_task, :product_create_task)]

      tasks_to_keep   = [FactoryBot.create(:dynflow_task, :user_create_task) do |task|
                           task.started_at = task.ended_at = Time.zone.now
                           task.save
                         end]
      cleaner.expects(:tasks_to_csv)
      cleaner.delete
      ForemanTasks::Task.where(id: tasks_to_delete).must_be_empty
      ForemanTasks::Task.where(id: tasks_to_keep).must_equal tasks_to_keep
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
      header.must_equal ForemanTasks::Task.attribute_names.join(',')
      expected_lines = tasks_to_delete.map { |task| task.attributes.values.join(',') }
      data.count.must_equal expected_lines.count
      expected_lines.each { |line| data.must_include line }
      ForemanTasks::Task.where(id: tasks_to_delete).must_be_empty
    end

    class ActionWithCleanup < Actions::Base
      def self.cleanup_after
        '15d'
      end
    end

    describe 'default behaviour' do
      it 'searches for the actions that have the cleanup_after defined' do
        ForemanTasks::Cleaner.stubs(:cleanup_settings => {})
        ForemanTasks::Cleaner.actions_with_default_cleanup[ActionWithCleanup].must_equal '15d'
      end

      it 'searches for the actions that have the cleanup_after defined' do
        ForemanTasks::Cleaner.stubs(:cleanup_settings =>
                                     { :actions => [{ :name => ActionWithCleanup.name, :after => '5d' }] })
        ForemanTasks::Cleaner.actions_with_default_cleanup[ActionWithCleanup].must_equal '5d'
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
        r1[:filter].must_equal '(label !^ (action1, action2)) AND (label = something)'
        r1[:states].must_equal %w[stopped paused]
        r2[:filter].must_equal '(label = something_else)'
        r2[:states].must_equal []
      end
    end
  end
end
