require 'rake'
require 'foreman_tasks_test_helper'

class GenerateTaskActionsTest < ActiveSupport::TestCase

  TASK_NAME = 'foreman_tasks:generate_task_actions'

  setup do
    Rake.application.rake_require 'foreman_tasks/tasks/generate_task_actions'

    Rake::Task.define_task(:environment)
    Rake::Task[TASK_NAME].reenable
  end

  let(:tasks) do
    (1..5).map { FactoryBot.build(:dynflow_task) }
  end

  it 'fixes the tasks' do
    label = 'a label'
    tasks
    ForemanTasks::Task.update_all(:action => nil)
    ForemanTasks::Task.any_instance.stubs(:to_label).returns(label)

    stdout, _stderr = capture_io do
      Rake.application.invoke_task TASK_NAME
    end

    assert_match(/Generating action for #{tasks.count} tasks/, stdout)
    ForemanTasks::Task.where(:action => label).count.must_equal tasks.count
    assert_match(/Processed #{tasks.count}\/#{tasks.count} tasks/, stdout)
  end

  it 'fixes only tasks with missing action' do
    tasks
    ForemanTasks::Task.any_instance.expects(:save!).never

    stdout, _stderr = capture_io do
      Rake.application.invoke_task TASK_NAME
    end

    assert_match(/Generating action for 0 tasks/, stdout)
  end
end
