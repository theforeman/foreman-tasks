require "foreman_tasks_test_helper"

module ForemanTasks
  class TasksHelperTest < ActionView::TestCase

    describe 'when formatting simple input' do
      before do
        @task = FactoryGirl.build(:user_create_task)
        humanized = {:action=>"Create", :input=>[[:user, {:text=>"user 'Anonymous Admin'", :link=>nil}]], :output=>"", :errors=>[]}
        @task.stubs(:input).returns({"user"=>{"id"=>1, "name"=>"Anonymous Admin"}, "locale"=>"en"})
        @task.stubs(:humanized).returns(humanized)
      end

      it 'formats the task input properly' do
        expects(:h).with("user 'Anonymous Admin'")
        format_task_input(@task)
        expects(:h).with("Create user 'Anonymous Admin'")
        format_task_input(@task, true)
      end

    end

    describe 'when formatting input' do
      before do
        @task = FactoryGirl.build(:product_create_task)
        humanized = {:action=>"Create",
                     :input=>[[:product, {:text=>"product 'product-2'", :link=>"#/products/3/info"}], [:organization, {:text=>"organization 'test-0'", :link=>"/organizations/3/edit"}]],
                     :output=>"",
                     :errors=>[]}
        input = {"product"=>{"id"=>3, "name"=>"product-2", "label"=>"product-2", "cp_id"=>nil},
                 "provider"=>{"id"=>3, "name"=>"Anonymous"},
                 "organization"=>{"id"=>3, "name"=>"test-0", "label"=>"test-0"},
                 "cp_id"=>"1412251033866",
                 "locale"=>"en"}
        @task.stubs(:input).returns(input)
        @task.stubs(:humanized).returns(humanized)
      end

      it 'formats the task input properly' do
        response = "product 'product-2'; organization 'test-0'"
        expects(:h).with(response)
        format_task_input(@task)
        expects(:h).with("Create #{response}")
        format_task_input(@task, true)
      end
    end
  end
end
