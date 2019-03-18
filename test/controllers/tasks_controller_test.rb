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

      def linked_task(resource)
        FactoryBot.create(:some_task).tap { |t| ForemanTasks::Lock.link!(resource, t.id) }
      end

      def in_taxonomy_scope(organization, location = nil)
        Organization.current = organization
        Location.current = location unless location.nil?
        yield organization, location
        Organization.current = Location.current = nil
      end

      describe 'summary' do
        it 'works' do
          FactoryBot.create(:some_task, :action => 'Some action')
          get(:summary, params: { recent_timeframe: 24 }, session: set_session_user)
          assert_response :success
          response = JSON.parse(@response.body)
          assert response['running']
        end
      end

      it 'supports csv export' do
        FactoryBot.create(:some_task, :action => 'Some action')
        get(:index, params: { format: :csv }, session: set_session_user)
        assert_response :success
        assert_equal 2, response.body.lines.size
        assert_include response.body.lines[1], 'Some action'
      end

      describe 'taxonomy scoping' do
        let(:organizations) { (0..1).map { FactoryBot.create(:organization) } }
        let(:tasks) { organizations.map { |o| linked_task(o) } + [FactoryBot.create(:some_task)] }

        it 'takes other searches into account' do
          task = tasks.first
          @controller.stubs(:params).returns(:search => "id = #{task.id}")
          in_taxonomy_scope(organizations.first) do |_o, _l|
            results = @controller.send(:filter, ForemanTasks::Task)
            results.map(&:id).sort.must_equal [task.id]
          end
        end

        it 'does not scope by taxonomy if unset' do
          organizations
          tasks
          @controller.send(:current_taxonomy_search).must_equal ''
          results = @controller.send(:filter, ForemanTasks::Task)
          results.map(&:id).sort.must_equal tasks.map(&:id).sort
        end

        it 'scopes by organization if set' do
          scoped, _, unscoped = tasks
          in_taxonomy_scope(organizations.first) do |o, _l|
            @controller.send(:current_taxonomy_search).must_equal "(organization_id = #{o.id})"
            results = @controller.send(:filter, ForemanTasks::Task)
            results.map(&:id).sort.must_equal [scoped, unscoped].map(&:id).sort
          end
        end

        it 'scopes by org and location if set' do
          in_taxonomy_scope(organizations.first, FactoryBot.create(:location)) do |o, l|
            @controller.send(:current_taxonomy_search).must_equal "(organization_id = #{o.id} AND location_id = #{l.id})"
          end
        end
      end
    end
  end
end
