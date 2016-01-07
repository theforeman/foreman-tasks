require "foreman_tasks_test_helper"

module ForemanTasks
  class DynflowConsoleAuthorizerTest <  ActiveSupport::TestCase
    include Rack::Test::Methods

    before do
      User.current = User.where(:login => 'apiadmin').first
    end

    let(:own_task)     { FactoryGirl.create(:dynflow_task, :set_owner => user) }
    let(:foreign_task) { FactoryGirl.create(:dynflow_task) }

    let(:edit_foreman_tasks_permission) do
      FactoryGirl.build(:permission).tap do |permission|
        permission.name = :edit_foreman_tasks
        permission.resource_type = ForemanTasks::Task.name
        permission.save!
      end
    end

    def dynflow_console_authorized?(task = nil)
      dynflow_path = '/'
      dynflow_path += task.external_id.to_s if task
      dynflow_rack_env = { "rack.session" => { "user" => user.id, "expires_at" => Time.now + 100 },
                           "PATH_INFO"     => dynflow_path}.with_indifferent_access
      ForemanTasks::Dynflow::ConsoleAuthorizer.new(dynflow_rack_env).allow?
    end

    describe 'admin user' do
      let(:user) { FactoryGirl.create(:user, :admin) }
      it 'can see all tasks' do
        assert dynflow_console_authorized?
        assert dynflow_console_authorized?(own_task)
        assert dynflow_console_authorized?(foreign_task)
      end
    end

    describe 'user with unlimited edit_foreman_tasks permissions' do
      let(:user) do
        user_role = FactoryGirl.create(:user_user_role)
        FactoryGirl.create(:filter,
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
        user_role = FactoryGirl.create(:user_user_role)
        FactoryGirl.create(:filter,
                           :search => 'owner.id = current_user',
                           :role => user_role.role, :permissions => [edit_foreman_tasks_permission])
        user_role.owner
      end

      it 'can see only the tasks he has permissions on' do
        refute dynflow_console_authorized?
        assert dynflow_console_authorized?(own_task)
        refute dynflow_console_authorized?(foreign_task)
      end
    end

    describe 'user without edit_foreman_tasks permissions' do
      let(:user) { FactoryGirl.create(:user) }
      it 'can not see any tasks' do
        refute dynflow_console_authorized?
        refute dynflow_console_authorized?(own_task)
        refute dynflow_console_authorized?(foreign_task)
      end
    end
  end
end
