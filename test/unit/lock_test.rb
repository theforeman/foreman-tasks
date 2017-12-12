require 'ostruct'
require 'foreman_tasks_test_helper'

module ForemanTasks
  class LockTest < ::ActiveSupport::TestCase
    describe ::ForemanTasks::Lock::LockConflict do
      class FakeLockConflict < ForemanTasks::Lock::LockConflict
        def _(val)
          val.freeze
        end
      end

      it 'does not modify frozen strings' do
        required_lock = OpenStruct.new(:name => 'my_lock')
        # Before #21770 the next line would raise
        #   RuntimeError: can't modify frozen String
        conflict = FakeLockConflict.new(required_lock, [])
        assert conflict._('this should be frozen').frozen?
      end
    end
  end
end
