require 'foreman_tasks_test_helper'

class TriggeringTest < ActiveSupport::TestCase
  describe 'validation' do
    it 'is valid when immediate' do
      assert_predicate(FactoryBot.build(:triggering), :valid?)
    end

    it 'is validates future execution' do
      triggering = FactoryBot.build(:triggering, :future)
      assert_predicate(triggering, :valid?)
      triggering.start_before = triggering.start_at - 120
      assert_not_predicate(triggering, :valid?)
    end

    it 'is invalid when recurring logic is invalid' do
      triggering = FactoryBot.build(:triggering, :recurring)
      assert_predicate(triggering, :valid?)
      triggering.recurring_logic.stubs(:valid?).returns(false)
      assert_not_predicate(triggering, :valid?)
    end

    it 'is valid when recurring logic has purpose' do
      logic = FactoryBot.build(:recurring_logic, :purpose => 'test', :state => 'active')
      triggering = FactoryBot.build(:triggering, :recurring_logic => logic, :mode => :recurring, :input_type => :cronline, :cronline => '* * * * *')
      assert_predicate(triggering, :valid?)
    end

    it 'is invalid when recurring logic with given purpose exists' do
      FactoryBot.create(:recurring_logic, :purpose => 'test', :state => 'active')
      logic = FactoryBot.build(:recurring_logic, :purpose => 'test', :state => 'active')
      triggering = FactoryBot.build(:triggering, :recurring_logic => logic, :mode => :recurring, :input_type => :cronline, :cronline => '* * * * *')
      assert_not_predicate(triggering, :valid?)
    end

    it 'is valid when recurring logic with given purpose exists and is not active or disabled' do
      ['finished', 'cancelled', 'failed'].each do |item|
        FactoryBot.create(:recurring_logic, :purpose => 'test', :state => item)
      end
      logic = FactoryBot.build(:recurring_logic, :purpose => 'test')
      triggering = FactoryBot.build(:triggering, :recurring_logic => logic, :mode => :recurring, :input_type => :cronline, :cronline => '* * * * *')
      assert_predicate(triggering, :valid?)
    end
  end

  it 'cannot have mode set to arbitrary value' do
    triggering = FactoryBot.build(:triggering)
    assert_predicate(triggering, :valid?)
    assert_raises(ArgumentError) { triggering.mode = 'bogus' }
    assert_raises(ArgumentError) { triggering.mode = 27 }
  end
end
