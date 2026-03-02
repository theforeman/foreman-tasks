require 'foreman_tasks_test_helper'

module ForemanTasks
  class TasksControllerTest < ActionController::TestCase
    describe ForemanTasks::TasksController do
      # rubocop:disable Naming/AccessorMethodName
      def get_factory_name
        :dynflow_task
      end
      # rubocop:enable Naming/AccessorMethodName

      def linked_task(resource)
        FactoryBot.create(:some_task).tap { |t| ForemanTasks::Link.link!(resource, t) }
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

        it 'shows summary only for the tasks the user is allowed to see' do
          setup_user('view', 'foreman_tasks', 'owner.id = current_user')
          FactoryBot.create(:some_task)
          get(:summary, params: { recent_timeframe: 24 }, session: set_session_user(User.current))
          assert_response :success
          response = JSON.parse(@response.body)
          assert_equal 0, response['stopped']['total']
        end

        describe 'taxonomy scoping' do
          before do
            @organizations = [0, 0].map { FactoryBot.create(:organization) }
            @locations = [0, 0].map { FactoryBot.create(:location) }
            @tasks = [0, 0].map { FactoryBot.create(:some_task) }
            @tasks.zip(@organizations, @locations).each do |task, org, loc|
              Link.link!(org, task)
              Link.link!(loc, task)
            end
          end

          it 'does not limit if unset' do
            get(:summary, params: { recent_timeframe: 24 }, session: set_session_user)
            assert_response :success
            response = JSON.parse(@response.body)
            assert_equal 2, response['stopped']['total']
          end

          it 'finds only tasks with matching taxonomies' do
            get(:summary, params: { recent_timeframe: 24 },
                          session: set_session_user.merge(:organization_id => @organizations.first, :location_id => @locations.first))
            assert_response :success
            response = JSON.parse(@response.body)
            assert_equal 1, response['stopped']['total']
          end

          it 'find no tasks when taxonomy combination contains no tasks' do
            get(:summary, params: { recent_timeframe: 24 },
                          session: set_session_user.merge(:organization_id => @organizations.first, :location_id => @locations.last))
            assert_response :success
            response = JSON.parse(@response.body)
            assert_equal 0, response['stopped']['total']
          end
        end
      end

      it 'supports csv export' do
        FactoryBot.create(:some_task, :action => 'Some action')
        get(:index, params: { format: :csv }, session: set_session_user)
        assert_response :success
        assert_equal 2, response.body.lines.size
        assert_include response.body.lines[1], 'Some action'
      end

      describe 'show' do
        it 'does not allow user without permissions to see task details' do
          setup_user('view', 'foreman_tasks', 'owner.id = current_user')
          get :show, params: { id: FactoryBot.create(:some_task).id },
                     session: set_session_user(User.current)
          assert_response :not_found
        end
      end

      describe 'index' do
        it 'shows duration column' do
          task = ForemanTasks::Task.select_duration.find(FactoryBot.create(:some_task).id)
          get(:index, params: {}, session: set_session_user)
          assert_response :success
          row = CSV.parse(response.body, headers: true).first
          assert_include row['Duration'], task.duration.in_seconds.to_s
        end
      end

      describe 'sub_tasks' do
        it 'does not allow user without permissions to see task details' do
          setup_user('view', 'foreman_tasks', 'owner.id = current_user')
          get :sub_tasks, params: { id: FactoryBot.create(:some_task).id },
                          session: set_session_user(User.current)
          assert_response :not_found
        end

        it 'supports csv export' do
          parent = FactoryBot.create(:some_task, :action => 'Some action')
          child = FactoryBot.create(:some_task, :action => 'Child action')
          child.parent_task_id = parent.id
          child.save!
          get(:sub_tasks, params: { id: parent.id, format: :csv }, session: set_session_user)
          assert_response :success
          assert_equal 2, response.body.lines.size
          assert_include response.body.lines[1], 'Child action'
        end

        it 'shows duration column' do
          parent = ForemanTasks::Task.find(FactoryBot.create(:some_task).id)
          child = ForemanTasks::Task.select_duration.find(FactoryBot.create(:some_task).id)
          child.parent_task_id = parent.id
          child.save!
          get(:sub_tasks, params: { id: parent.id }, session: set_session_user)
          assert_response :success
          row = CSV.parse(response.body, headers: true).first
          assert_include row['Duration'], child.duration.in_seconds.to_s
        end
      end

      describe 'taxonomy scoping' do
        let(:organizations) { (0..1).map { FactoryBot.create(:organization) } }
        let(:tasks) { organizations.map { |o| linked_task(o) } + [FactoryBot.create(:some_task)] }

        it 'takes other searches into account' do
          task = tasks.first
          @controller.stubs(:params).returns(:search => "id = #{task.id}")
          in_taxonomy_scope(organizations.first) do |_o, _l|
            results = @controller.send(:filter, ForemanTasks::Task)
            assert_equal [task.id], results.map(&:id).sort
          end
        end

        it 'does not scope by taxonomy if unset' do
          organizations
          tasks
          assert_equal '', @controller.send(:current_taxonomy_search)
          results = @controller.send(:filter, ForemanTasks::Task)
          assert_equal tasks.map(&:id).sort, results.map(&:id).sort
        end

        it 'scopes by organization if set' do
          scoped, _, unscoped = tasks
          in_taxonomy_scope(organizations.first) do |o, _l|
            assert_equal "(organization_id = #{o.id})", @controller.send(:current_taxonomy_search)
            results = @controller.send(:filter, ForemanTasks::Task)
            assert_equal [scoped, unscoped].map(&:id).sort, results.map(&:id).sort
          end
        end

        it 'scopes by org and location if set' do
          in_taxonomy_scope(organizations.first, FactoryBot.create(:location)) do |o, l|
            assert_equal "(organization_id = #{o.id} AND location_id = #{l.id})", @controller.send(:current_taxonomy_search)
          end
        end
      end
    end
  end
end
