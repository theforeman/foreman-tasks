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
        assert_equal 1, items.count
        assert_equal 'Tasks', items.first[:caption]
        assert_nil items.first[:url]
      end

      it 'prepares items for show correctly' do
        @task = FactoryBot.build(:dynflow_task, :user_create_task)
        @task.action = 'A task'
        stubs(:action_name).returns('show')
        items = breadcrumb_items
        assert_equal ['Tasks', 'A task'], items.map { |i| i[:caption] }
        assert_nil items.last[:url]
      end

      it 'prepares items for sub tasks correctly' do
        @task = FactoryBot.build(:dynflow_task, :user_create_task)
        child = FactoryBot.build(:dynflow_task, :user_create_task)
        @task.sub_tasks = [child]
        @task.action = 'A task'
        stubs(:action_name).returns('sub_tasks')
        items = breadcrumb_items
        assert_equal ['Tasks', 'A task', 'Sub tasks'], items.map { |i| i[:caption] }
        assert_nil items.last[:url]
      end
    end
  end
end
