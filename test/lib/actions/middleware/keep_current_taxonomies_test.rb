require 'foreman_tasks_test_helper'

module Actions
  module Middleware
    class KeepCurrentTaxonomiesTest < ActiveSupport::TestCase
      include ::Dynflow::Testing

      class TestAction < Support::DummyDynflowAction
        middleware.use KeepCurrentTaxonomies

        def run; end
      end

      before do
        @org = mock('organization')
        @org.stubs(:id).returns(1)
        @loc = mock('location')
        @loc.stubs(:id).returns(2)
      end

      describe 'plan' do
        test 'with current taxonomies set' do
          Organization.expects(:current).twice.returns(@org)
          Location.expects(:current).twice.returns(@loc)

          @action = create_and_plan_action(TestAction)
          assert_equal(@org.id, @action.input['current_organization_id'])
          assert_equal(@loc.id, @action.input['current_location_id'])
        end

        test 'with one current taxonomy set (organization)' do
          Organization.expects(:current).twice.returns(@org)
          Location.expects(:current).twice

          @action = create_and_plan_action(TestAction)
          assert_equal(@org.id, @action.input['current_organization_id'])
          assert_nil(@action.input['current_location_id'])
        end
      end

      describe 'run' do
        before do
          Organization.stubs(:current).returns(@org)
          Location.stubs(:current).returns(@loc)

          @action = create_and_plan_action(TestAction)

          Organization.stubs(:current)
          Location.stubs(:current)
        end

        test 'with current taxonomies as input' do
          Organization.unscoped.class.any_instance.expects(:find).with(@org.id).returns(@org)
          Location.unscoped.class.any_instance.expects(:find).with(@loc.id).returns(@loc)

          Organization.expects(:current=).with(@org)
          Location.expects(:current=).with(@loc)

          Organization.stubs(:current=).with(nil)
          Location.stubs(:current=).with(nil)

          @action = run_action(@action)
        end
      end
    end
  end
end
