require 'foreman_tasks_test_helper'

module ForemanTasks
  class TasksHelperTest < ActionView::TestCase
    describe 'when formatting simple input' do
      before do
        @task = FactoryBot.build(:dynflow_task, :user_create_task)
        humanized = { :humanized_name => 'Create', :humanized_input => [[:user, { :text => "user 'Anonymous Admin'", :link => nil }]] }
        @task.instance_variable_set('@humanized_cache', humanized)
        @task.stubs(:input).returns('user' => { 'id' => 1, 'name' => 'Anonymous Admin' }, 'locale' => 'en')
        @task.stubs(:action).returns(@task.to_label)
      end

      it 'formats the task input properly' do
        format_task_input(@task).must_equal("Create user 'Anonymous Admin'")
      end

      it 'displays the dash if task is nil' do
        format_task_input(nil).must_equal('-')
      end
    end

    describe 'when formatting input' do
      before do
        @task = FactoryBot.build(:dynflow_task, :product_create_task)
        humanized = { :humanized_name => 'Create',
                      :humanized_input => [[:product, { :text => "product 'product-2'", :link => '#/products/3/info' }], [:organization, { :text => "organization 'test-0'", :link => '/organizations/3/edit' }]] }
        @task.instance_variable_set('@humanized_cache', humanized)
        input = { 'product' => { 'id' => 3, 'name' => 'product-2', 'label' => 'product-2', 'cp_id' => nil },
                  'provider' => { 'id' => 3, 'name' => 'Anonymous' },
                  'organization' => { 'id' => 3, 'name' => 'test-0', 'label' => 'test-0' },
                  'cp_id' => '1412251033866',
                  'locale' => 'en' }
        @task.stubs(:input).returns(input)
        @task.stubs(:action).returns(@task.to_label)
      end

      it 'formats the task input properly' do
        response = "product 'product-2'; organization 'test-0'"
        format_task_input(@task).must_equal("Create #{response}")
      end
    end
  end
end
