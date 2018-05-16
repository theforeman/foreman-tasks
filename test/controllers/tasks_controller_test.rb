require 'foreman_tasks_test_helper'

module ForemanTasks
  class TasksControllerTest < ActionController::TestCase
    describe ForemanTasks::TasksController do
      basic_index_test('tasks')
      basic_pagination_per_page_test
      basic_pagination_rendered_test

      # rubocop:disable Naming/AccessorMethodName
      def get_factory_name
        :dynflow_task
      end
      # rubocop:enable Naming/AccessorMethodName

      describe 'taxonomy scoping' do
        let(:organizations) { (0..1).map { FactoryBot.create(:organization) } }
        let(:linked_task) do
          ->(resource) do
            t = FactoryBot.create(:some_task)
            ForemanTasks::Lock.link!(resource, t.id)
            t
          end
        end
        let(:tasks) { organizations.map { |o| linked_task.(o) } + [FactoryBot.create(:some_task)] }
        let(:in_taxonomy_scope) do
          ->(organization, location = nil, &block) do
            Organization.current = organization unless organization.nil?
            Location.current = location unless location.nil?
            yield organization, location
            Organization.current = Location.current = nil
          end
        end

        it 'takes other searches into account' do
          task = tasks.first
          @controller.stubs(:params).returns(:search => "id = #{task.id}")
          in_taxonomy_scope.(organizations.first) do |_o, _l|
            results = @controller.send(:filter, ForemanTasks::Task)
            results.map(&:id).sort.must_equal [task.id]
          end
        end

        it 'does not scope by taxonomy if unset' do
          organizations; tasks
          @controller.send(:current_taxonomy_search).must_equal ''
          results = @controller.send(:filter, ForemanTasks::Task)
          results.map(&:id).sort.must_equal tasks.map(&:id).sort
        end

        it 'scopes by organization if set' do
          scoped, _, unscoped = tasks
          in_taxonomy_scope.(organizations.first) do |o, _l|
            @controller.send(:current_taxonomy_search).must_equal "(organization_id = #{o.id})"
            results = @controller.send(:filter, ForemanTasks::Task)
            results.map(&:id).sort.must_equal [scoped, unscoped].map(&:id).sort
          end
        end

        it 'scopes by org and location if set' do
          in_taxonomy_scope.(organizations.first, FactoryBot.create(:location)) do |o, l|
            @controller.send(:current_taxonomy_search).must_equal "(organization_id = #{o.id} AND location_id = #{l.id})"
          end
        end
      end
    end
  end
end
