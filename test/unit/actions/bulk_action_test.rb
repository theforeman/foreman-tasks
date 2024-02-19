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

    class KwArgChildAction < Actions::EntryAction
      def plan(_target, options = {})
        plan_self(kw_string: options['kw'], kw_symbol: options[:kw])
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
        Target.expects(:unscoped).returns(Target)
        Target.expects(:where).with(:id => targets.map(&:id)).returns(targets)

        assert_equal targets.count, task.sub_tasks.count
        success, failed = task.sub_tasks.partition { |sub_task| sub_task.result == 'success' }
        assert_empty failed
        assert_equal 5, success.count
      end

      specify 'it plans a task for each target even if target cannot be found' do
        Target.expects(:unscoped).returns(Target)
        Target.expects(:where).with(:id => targets.map(&:id)).returns(targets.take(4))

        assert_equal targets.count, task.sub_tasks.count
        success, failed = task.sub_tasks.partition { |sub_task| sub_task.result == 'success' }
        assert_equal 4, success.count
        assert_equal 1, failed.count
      end

      specify "it handles keyword arguments as indifferent hashes when they're being flattened" do
        Target.expects(:unscoped).returns(Target)
        Target.expects(:where).with(:id => targets.map(&:id)).returns(targets)

        triggered = ForemanTasks.trigger(ParentAction, KwArgChildAction, targets, kw: 7)
        task = ForemanTasks::Task.where(:external_id => triggered.id).first
        wait_for { task.reload.state == 'stopped' }
        task = task.sub_tasks.first
        assert_equal 7, task.input[:kw_string]
        assert_equal 7, task.input[:kw_symbol]
      end

      specify 'it allows setting concurrency limit' do
        Target.expects(:unscoped).returns(Target)
        Target.expects(:where).with(:id => targets.map(&:id)).returns(targets)

        triggered = ForemanTasks.trigger(ParentAction, ChildAction, targets, concurrency_limit: 25)
        task = ForemanTasks::Task.where(:external_id => triggered.id).first
        assert_equal 25, task.execution_plan.entry_action.concurrency_limit
      end
    end
  end
end
