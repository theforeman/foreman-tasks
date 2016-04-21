require 'foreman_tasks_test_helper'

class TriggeringTest < ActiveSupport::TestCase

  describe 'validation' do
    it 'is valid when immediate' do
      FactoryGirl.build(:triggering).must_be :valid?
    end

    it 'is validates future execution' do
      triggering = FactoryGirl.build(:triggering, :future)
      triggering.must_be :valid?
      triggering.start_before = triggering.start_at - 120
      triggering.wont_be :valid?
    end

    it 'is invalid when recurring logic is invalid' do
      triggering = FactoryGirl.build(:triggering, :recurring)
      triggering.must_be :valid?
      triggering.recurring_logic.stubs(:valid?).returns(false)
      triggering.wont_be :valid?
    end
  end
end
