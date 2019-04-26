require 'foreman_tasks_test_helper'

module ForemanTasks
  class BulkActionTest < ActiveSupport::TestCase
    before do
      User.current = User.where(:login => 'apiadmin').first
    end

    Target = Struct.new(:id)

    class ParentAction < Actions::BulkAction; end

    class ChildAction < Actions::EntryAction
      def plan(target)
        target.id
      end
    end

    describe Actions::BulkAction do
      include ForemanTasks::TestHelpers::WithInThreadExecutor

      let(:targets) { (1..5).map { |i| Target.new i } }
      let(:task) do
        triggered = ForemanTasks.trigger(ParentAction, ChildAction, targets)
        task = ForemanTasks::Task.where(:external_id => triggered.id).first
        wait_for { task.reload.state == 'stopped' }
        task
      end

      specify 'it plans a task for each target' do
        Target.expects(:where).with(:id => targets.map(&:id)).returns(targets)

        task.sub_tasks.count.must_equal targets.count
        success, failed = task.sub_tasks.partition { |sub_task| sub_task.result == 'success' }
        failed.must_be :empty?
        success.count.must_equal 5
      end

      specify 'it plans a task for each target even if target cannot be found' do
        Target.expects(:where).with(:id => targets.map(&:id)).returns(targets.take(4))

        task.sub_tasks.count.must_equal targets.count
        success, failed = task.sub_tasks.partition { |sub_task| sub_task.result == 'success' }
        success.count.must_equal 4
        failed.count.must_equal 1
      end
    end
  end
end
