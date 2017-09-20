require 'foreman_tasks_test_helper'

class TasksTest < ActiveSupport::TestCase
  describe ForemanTasks::Cleaner do
    it 'is able to delete tasks (including the dynflow plans) based on filter' do
      cleaner = ForemanTasks::Cleaner.new(:filter => 'label = "Actions::User::Create"', :after => '10d')

      tasks_to_delete = [FactoryGirl.create(:dynflow_task, :user_create_task),
                         FactoryGirl.create(:dynflow_task, :user_create_task)]
      tasks_to_keep   = [FactoryGirl.create(:dynflow_task, :user_create_task) do |task|
                           task.started_at = task.ended_at = Time.zone.now
                           task.save
                         end,
                         FactoryGirl.create(:dynflow_task, :product_create_task)]
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
      tasks_to_delete = [FactoryGirl.create(:dynflow_task, :user_create_task),
                         FactoryGirl.create(:dynflow_task, :user_create_task) do |task|
                           task.started_at = task.ended_at = Time.zone.now
                           task.save
                         end]

      tasks_to_keep   = [FactoryGirl.create(:dynflow_task, :product_create_task)]
      cleaner.delete
      ForemanTasks::Task.where(id: tasks_to_delete).must_be_empty
      ForemanTasks::Task.where(id: tasks_to_keep).must_equal tasks_to_keep
    end

    it 'supports passing empty filter (just delete all)' do
      cleaner = ForemanTasks::Cleaner.new(:filter => '', :after => '10d')
      tasks_to_delete = [FactoryGirl.create(:dynflow_task, :user_create_task),
                         FactoryGirl.create(:dynflow_task, :product_create_task)]

      tasks_to_keep   = [FactoryGirl.create(:dynflow_task, :user_create_task) do |task|
                           task.started_at = task.ended_at = Time.zone.now
                           task.save
                         end]
      cleaner.delete
      ForemanTasks::Task.where(id: tasks_to_delete).must_be_empty
      ForemanTasks::Task.where(id: tasks_to_keep).must_equal tasks_to_keep
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
        rules = [{ :after => nil, :avoid_actions => true },
                 { :after => '10d', :filter => 'label = something', :states => %w[stopped paused] },
                 { :after => '15d', :filter => 'label = something_else',
                   :avoid_actions => true, :states => [] }]
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
