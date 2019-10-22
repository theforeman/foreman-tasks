require 'foreman_tasks_test_helper'

module ForemanTasks
  class DynflowConsoleAuthorizerTest < ActiveSupport::TestCase
    include Rack::Test::Methods

    before do
      User.current = User.where(:login => 'apiadmin').first
    end

    let(:own_task)     { FactoryBot.create(:dynflow_task, :user => user) }
    let(:foreign_task) { FactoryBot.create(:dynflow_task) }

    let(:edit_foreman_tasks_permission) do
      Permission.where(:name => :edit_foreman_tasks).first
    end

    def dynflow_console_authorized?(task = nil)
      dynflow_path = '/'
      dynflow_path += task.external_id.to_s if task
      dynflow_rack_env = { 'rack.session' => { 'user' => user.id, 'expires_at' => Time.zone.now + 100 },
                           'PATH_INFO' => dynflow_path }.with_indifferent_access
      ForemanTasks::Dynflow::ConsoleAuthorizer.from_env(dynflow_rack_env).allow?
    end

    describe 'admin user' do
      let(:user) { FactoryBot.create(:user, :admin) }
      it 'can see all tasks' do
        assert dynflow_console_authorized?
        assert dynflow_console_authorized?(own_task)
        assert dynflow_console_authorized?(foreign_task)
      end
    end

    describe 'user with unlimited edit_foreman_tasks permissions' do
      let(:user) do
        user_role = FactoryBot.create(:user_user_role)
        FactoryBot.create(:filter,
                          :role => user_role.role, :permissions => [edit_foreman_tasks_permission])
        user_role.owner
      end

      it 'can see all tasks' do
        assert dynflow_console_authorized?
        assert dynflow_console_authorized?(own_task)
        assert dynflow_console_authorized?(foreign_task)
      end
    end

    describe 'user with limited edit_foreman_tasks permissions' do
      let(:user) do
        user_role = FactoryBot.create(:user_user_role)
        FactoryBot.create(:filter,
                          :search => 'owner.id = current_user',
                          :role => user_role.role, :permissions => [edit_foreman_tasks_permission])
        user_role.owner
      end

      it 'can see only the tasks he has permissions on' do
        assert_not dynflow_console_authorized?
        assert dynflow_console_authorized?(own_task)
        assert_not dynflow_console_authorized?(foreign_task)
      end
    end

    describe 'user without edit_foreman_tasks permissions' do
      let(:user) { FactoryBot.create(:user) }
      it 'can not see any tasks' do
        assert_not dynflow_console_authorized?
        assert_not dynflow_console_authorized?(own_task)
        assert_not dynflow_console_authorized?(foreign_task)
      end
    end
  end
end
