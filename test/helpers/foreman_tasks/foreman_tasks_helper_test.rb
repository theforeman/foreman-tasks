require 'foreman_tasks_test_helper'

module ForemanTasks
  class ForemanTasksHelperTest < ActionView::TestCase
    describe 'breadcrumb items' do
      before do
        self.class.send(:include, ForemanTasks::TasksHelper)
      end

      it 'prepares items for index correctly' do
        self.stubs(:action_name).returns('index')
        items = breadcrumb_items
        items.count.must_equal 1
        items.first[:caption].must_equal 'Tasks'
        items.first[:url].must_be_nil
      end

      it 'prepares items for show correctly' do
        @task = FactoryBot.build(:dynflow_task, :user_create_task)
        @task.action = 'A task'
        self.stubs(:action_name).returns('show')
        items = breadcrumb_items
        items.map { |i| i[:caption] }.must_equal ['Tasks', 'A task']
        items.last[:url].must_be_nil
      end

      it 'prepares items for sub tasks correctly' do
        @task = FactoryBot.build(:dynflow_task, :user_create_task)
        child = FactoryBot.build(:dynflow_task, :user_create_task)
        @task.sub_tasks = [child]
        @task.action = 'A task'
        self.stubs(:action_name).returns('sub_tasks')
        items = breadcrumb_items
        items.map { |i| i[:caption] }.must_equal ['Tasks', 'A task', 'Sub tasks']
        items.last[:url].must_be_nil
      end
    end
  end
end
