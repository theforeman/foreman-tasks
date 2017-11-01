require 'foreman_tasks_test_helper'

class TriggeringTest < ActiveSupport::TestCase
  describe 'validation' do
    it 'is valid when immediate' do
      FactoryBot.build(:triggering).must_be :valid?
    end

    it 'is validates future execution' do
      triggering = FactoryBot.build(:triggering, :future)
      triggering.must_be :valid?
      triggering.start_before = triggering.start_at - 120
      triggering.wont_be :valid?
    end

    it 'is invalid when recurring logic is invalid' do
      triggering = FactoryBot.build(:triggering, :recurring)
      triggering.must_be :valid?
      triggering.recurring_logic.stubs(:valid?).returns(false)
      triggering.wont_be :valid?
    end
  end

  it 'cannot have mode set to arbitrary value' do
    triggering = FactoryBot.build(:triggering)
    triggering.must_be :valid?
    proc { triggering.mode = 'bogus' }.must_raise ArgumentError
    proc { triggering.mode = 27 }.must_raise ArgumentError
  end
end
