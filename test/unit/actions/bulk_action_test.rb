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

        _(task.sub_tasks.count).must_equal targets.count
        success, failed = task.sub_tasks.partition { |sub_task| sub_task.result == 'success' }
        _(failed).must_be :empty?
        _(success.count).must_equal 5
      end

      specify 'it plans a task for each target even if target cannot be found' do
        Target.expects(:unscoped).returns(Target)
        Target.expects(:where).with(:id => targets.map(&:id)).returns(targets.take(4))

        _(task.sub_tasks.count).must_equal targets.count
        success, failed = task.sub_tasks.partition { |sub_task| sub_task.result == 'success' }
        _(success.count).must_equal 4
        _(failed.count).must_equal 1
      end

      specify "it handles keyword arguments as indifferent hashes when they're being flattened" do
        Target.expects(:unscoped).returns(Target)
        Target.expects(:where).with(:id => targets.map(&:id)).returns(targets)

        triggered = ForemanTasks.trigger(ParentAction, KwArgChildAction, targets, kw: 7)
        task = ForemanTasks::Task.where(:external_id => triggered.id).first
        wait_for { task.reload.state == 'stopped' }
        task = task.sub_tasks.first
        _(task.input[:kw_string]).must_equal 7
        _(task.input[:kw_symbol]).must_equal 7
      end
    end
  end
end
