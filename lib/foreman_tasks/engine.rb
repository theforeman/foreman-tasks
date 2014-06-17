module ForemanTasks
  class Engine < ::Rails::Engine
    engine_name "foreman_tasks"

    initializer 'foreman_tasks.load_default_settings', :before => :load_config_initializers do
      require_dependency File.expand_path('../../../app/models/setting/foreman_tasks.rb', __FILE__) if (Setting.table_exists? rescue(false))
    end

    initializer 'foreman_tasks.register_plugin', :after => :finisher_hook do |app|
      Foreman::Plugin.register :"foreman-tasks" do
        requires_foreman '> 1.3'
        divider :top_menu, :parent => :monitor_menu, :after => :audits
        menu :top_menu, :tasks,
             :url_hash => { :controller => 'foreman_tasks/tasks', :action => :index },
             :caption  => N_('Tasks'),
             :parent   => :monitor_menu
      end
    end

    initializer 'foreman_tasks.ignore_dynflow_tables' do |app|
      # Ignore Dynflow tables when schema-dumping. Dynflow tables are handled automatically by Dynflow.
      ActiveRecord::SchemaDumper.ignore_tables << /^dynflow_.*$/
    end

    initializer "foreman_tasks.apipie" do
      # this condition is here for compatibility reason to work with Foreman 1.4.x
      if Apipie.configuration.api_controllers_matcher.is_a?(Array) &&
            Apipie.configuration.respond_to?(:checksum_path)
        Apipie.configuration.api_controllers_matcher << "#{ForemanTasks::Engine.root}/app/controllers/foreman_tasks/api/*.rb"
        Apipie.configuration.checksum_path += ['/foreman_tasks/api/']
      end
    end

    initializer "foreman_tasks.register_paths" do |app|
      ForemanTasks.dynflow.config.eager_load_paths.concat(%W[#{ForemanTasks::Engine.root}/app/lib/actions])
    end

    initializer "foreman_tasks.load_app_instance_data" do |app|
      app.config.paths['db/migrate'] += ForemanTasks::Engine.paths['db/migrate'].existent
    end

    # to enable async Foreman operations using Dynflow
    if ENV['FOREMAN_TASKS_MONKEYS'] == 'true'
      initializer "foreman_tasks.require_dynflow", :before => "foreman_tasks.initialize_dynflow" do |app|
        ForemanTasks.dynflow.require!
      end

      config.to_prepare do
        ::Api::V2::HostsController.send :include, ForemanTasks::Concerns::HostsControllerExtension
        ::Host::Base.send :include, ForemanTasks::Concerns::HostActionSubject
        ::Architecture.send :include, ForemanTasks::Concerns::ArchitectureActionSubject
      end
    end

    initializer "foreman_tasks.initialize_dynflow" do
      ForemanTasks.dynflow.eager_load_actions!
      ActionDispatch::Reloader.to_prepare do
        ForemanTasks.dynflow.eager_load_actions!
      end

      ForemanTasks.dynflow.config.increase_db_pool_size

      unless ForemanTasks.dynflow.config.lazy_initialization
        if defined?(PhusionPassenger)
          PhusionPassenger.on_event(:starting_worker_process) do |forked|
            if forked
              ForemanTasks.dynflow.initialize!
            end
          end
        else
          ForemanTasks.dynflow.initialize!
        end
      end
    end

    rake_tasks do
      load File.expand_path('../tasks/dynflow.rake', __FILE__)
    end
  end

  def self.table_name_prefix
    "foreman_tasks_"
  end

  def use_relative_model_naming
    true
  end
end
