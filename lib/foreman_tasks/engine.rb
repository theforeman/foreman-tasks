require 'foreman_tasks_core'
require 'fast_gettext'
require 'gettext_i18n_rails'

module ForemanTasks
  class Engine < ::Rails::Engine
    engine_name 'foreman_tasks'

    initializer 'foreman_tasks.load_default_settings', :before => :load_config_initializers do
      require_dependency File.expand_path('../../../app/models/setting/foreman_tasks.rb', __FILE__) if begin
                                                                                                         Setting.table_exists?
                                                                                                       rescue
                                                                                                         false
                                                                                                       end
    end

    # Precompile any JS or CSS files under app/assets/
    # If requiring files from each other, list them explicitly here to avoid precompiling the same
    # content twice.
    assets_to_precompile =
      Dir.chdir(root) do
        Dir['app/assets/javascripts/**/*', 'app/assets/stylesheets/**/*'].map do |f|
          f.split(File::SEPARATOR, 4).last
        end
      end

    initializer 'foreman_tasks.assets.precompile' do |app|
      app.config.assets.precompile += assets_to_precompile
    end

    initializer 'foreman_tasks.configure_assets', group: :assets do
      SETTINGS[:foreman_tasks] = { :assets => { :precompile => assets_to_precompile } }
    end

    initializer 'foreman_tasks.register_gettext', :after => :load_config_initializers do
      locale_dir = File.join(File.expand_path('../../..', __FILE__), 'locale')
      locale_domain = 'foreman_tasks'

      Foreman::Gettext::Support.add_text_domain locale_domain, locale_dir
    end

    initializer 'foreman_tasks.register_plugin', :before => :finisher_hook do |_app|
      Foreman::Plugin.register :"foreman-tasks" do
        requires_foreman '>= 1.16.0'
        divider :top_menu, :parent => :monitor_menu, :last => true
        menu :top_menu, :tasks,
             :url_hash => { :controller => 'foreman_tasks/tasks', :action => :index },
             :caption  => N_('Tasks'),
             :parent   => :monitor_menu,
             :last     => true

        menu :top_menu, :recurring_logics,
             :url_hash => { :controller => 'foreman_tasks/recurring_logics', :action => :index },
             :caption  => N_('Recurring Logics'),
             :parent   => :monitor_menu,
             :last     => true

        security_block :foreman_tasks do |_map|
          permission :view_foreman_tasks, { :'foreman_tasks/tasks' => [:auto_complete_search, :sub_tasks, :index, :show],
                                            :'foreman_tasks/api/tasks' => [:bulk_search, :show, :index, :summary] }, :resource_type => ForemanTasks::Task.name
          permission :edit_foreman_tasks, { :'foreman_tasks/tasks' => [:resume, :unlock, :force_unlock, :cancel_step, :cancel, :abort],
                                            :'foreman_tasks/api/tasks' => [:bulk_resume] }, :resource_type => ForemanTasks::Task.name

          permission :create_recurring_logics, {}, :resource_type => ForemanTasks::RecurringLogic.name

          permission :view_recurring_logics, { :'foreman_tasks/recurring_logics' => [:index, :show],
                                               :'foreman_tasks/api/recurring_logics' => [:index, :show] }, :resource_type => ForemanTasks::RecurringLogic.name

          permission :edit_recurring_logics, { :'foreman_tasks/recurring_logics' => [:cancel, :enable, :disable],
                                               :'foreman_tasks/api/recurring_logics' => [:cancel, :update] }, :resource_type => ForemanTasks::RecurringLogic.name
        end

        add_all_permissions_to_default_roles

        logger :dynflow, :enabled => true
        logger :action, :enabled => true

        role 'Tasks Manager', [:view_foreman_tasks, :edit_foreman_tasks]
        role 'Tasks Reader', [:view_foreman_tasks]

        widget 'foreman_tasks/tasks/dashboard/tasks_status', :sizex => 6, :sizey => 1, :name => N_('Task Status')
        widget 'foreman_tasks/tasks/dashboard/latest_tasks_in_error_warning', :sizex => 6, :sizey => 1, :name => N_('Latest Warning/Error Tasks')
      end
    end

    initializer 'foreman_tasks.ignore_dynflow_tables' do |_app|
      # Ignore Dynflow tables when schema-dumping. Dynflow tables are handled automatically by Dynflow.
      ActiveRecord::SchemaDumper.ignore_tables << /^dynflow_.*$/
    end

    initializer 'foreman_tasks.apipie' do
      # this condition is here for compatibility reason to work with Foreman 1.4.x
      if Apipie.configuration.api_controllers_matcher.is_a?(Array) &&
         Apipie.configuration.respond_to?(:checksum_path)
        Apipie.configuration.api_controllers_matcher << "#{ForemanTasks::Engine.root}/app/controllers/foreman_tasks/api/*.rb"
        Apipie.configuration.checksum_path += ['/foreman_tasks/api/']
      end
    end

    initializer 'foreman_tasks.register_paths' do |_app|
      ForemanTasks.dynflow.config.eager_load_paths.concat(%W[#{ForemanTasks::Engine.root}/app/lib/actions #{ForemanTasks::Engine.root}/app/lib/hooks])
    end

    initializer 'foreman_tasks.test_exceptions' do |_app|
      if defined? ActiveSupport::TestCase
        require 'foreman_tasks/test_extensions'
      end
    end

    initializer 'foreman_tasks.load_app_instance_data' do |app|
      ForemanTasks::Engine.paths['db/migrate'].existent.each do |path|
        app.config.paths['db/migrate'] << path
      end
    end

    initializer 'foreman_tasks.require_dynflow', :before => 'foreman_tasks.initialize_dynflow' do |_app|
      ForemanTasks.dynflow.require!
      ::ForemanTasks.dynflow.config.on_init(false) do |world|
        world.middleware.use Actions::Middleware::KeepCurrentTaxonomies
        world.middleware.use Actions::Middleware::KeepCurrentUser
        world.middleware.use Actions::Middleware::KeepCurrentTimezone
        world.middleware.use Actions::Middleware::KeepCurrentRequestID
      end

      ::ForemanTasks.dynflow.config.on_init do |world|
        ForemanTasksCore.dynflow_setup(world)
      end
    end

    initializer 'foreman_tasks.set_core_settings' do
      ForemanTasksCore::SettingsLoader.settings_registry.each_key do |settings_keys|
        settings = settings_keys.inject({}) do |h, settings_key|
          h.merge(SETTINGS[settings_key] || {})
        end
        ForemanTasksCore::SettingsLoader.setup_settings(settings_keys.first, settings)
      end
    end

    # to enable async Foreman operations using Dynflow
    if ENV['FOREMAN_TASKS_MONKEYS'] == 'true'
      config.to_prepare do
        ::Api::V2::HostsController.send :prepend, ForemanTasks::Concerns::HostsControllerExtension
        ::Host::Base.send :include, ForemanTasks::Concerns::HostActionSubject
      end
    end

    config.to_prepare do
      ForemanTasks.dynflow.eager_load_actions! if ForemanTasks.dynflow.initialized?

      Authorizer.send(:prepend, AuthorizerExt)
    end

    rake_tasks do
      %w[dynflow.rake test.rake export_tasks.rake cleanup.rake generate_task_actions.rake].each do |rake_file|
        full_path = File.expand_path("../tasks/#{rake_file}", __FILE__)
        load full_path if File.exist?(full_path)
      end
    end
  end

  def self.table_name_prefix
    'foreman_tasks_'
  end

  def use_relative_model_naming
    true
  end
end
