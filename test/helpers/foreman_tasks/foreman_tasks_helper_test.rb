require 'foreman_tasks_test_helper'

module ForemanTasks
  class ForemanTasksHelperTest < ActionView::TestCase
    describe 'breadcrumb items' do
      before do
        self.class.send(:include, ForemanTasks::TasksHelper)
      end

      it 'prepares items for index correctly' do
        stubs(:action_name).returns('index')
        items = breadcrumb_items
        _(items.count).must_equal 1
        _(items.first[:caption]).must_equal 'Tasks'
        _(items.first[:url]).must_be_nil
      end

      it 'prepares items for show correctly' do
        @task = FactoryBot.build(:dynflow_task, :user_create_task)
        @task.action = 'A task'
        stubs(:action_name).returns('show')
        items = breadcrumb_items
        _(items.map { |i| i[:caption] }).must_equal ['Tasks', 'A task']
        _(items.last[:url]).must_be_nil
      end

      it 'prepares items for sub tasks correctly' do
        @task = FactoryBot.build(:dynflow_task, :user_create_task)
        child = FactoryBot.build(:dynflow_task, :user_create_task)
        @task.sub_tasks = [child]
        @task.action = 'A task'
        stubs(:action_name).returns('sub_tasks')
        items = breadcrumb_items
        _(items.map { |i| i[:caption] }).must_equal ['Tasks', 'A task', 'Sub tasks']
        _(items.last[:url]).must_be_nil
      end
    end
  end
end
