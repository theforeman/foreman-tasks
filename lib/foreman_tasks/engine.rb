module ForemanTasks
  class Engine < ::Rails::Engine
    engine_name "foreman_tasks"

    initializer 'foreman_tasks.load_default_settings', :before => :load_config_initializers do
      require_dependency File.expand_path('../../../app/models/setting/foreman_tasks.rb', __FILE__) if (Setting.table_exists? rescue(false))
    end

    initializer 'foreman_tasks.register_plugin', :after => :finisher_hook do |app|
      Foreman::Plugin.register :"foreman-tasks" do
        requires_foreman '>= 1.9.0'
        divider :top_menu, :parent => :monitor_menu, :after => :audits
        menu :top_menu, :tasks,
             :url_hash => { :controller => 'foreman_tasks/tasks', :action => :index },
             :caption  => N_('Tasks'),
             :parent   => :monitor_menu

        security_block :foreman_tasks do |map|
          permission :view_foreman_tasks, {:'foreman_tasks/tasks' => [:auto_complete_search, :sub_tasks, :index, :show],
                                           :'foreman_tasks/api/tasks' => [:bulk_search, :show, :index, :summary] }, :resource_type => ForemanTasks::Task.name
          permission :edit_foreman_tasks, {:'foreman_tasks/tasks' => [:resume, :unlock, :force_unlock, :cancel_step, :cancel],
                                           :'foreman_tasks/api/tasks' => [:bulk_resume]}, :resource_type => ForemanTasks::Task.name
        end

        logger :dynflow, :enabled => true
        logger :action, :enabled => true

        role "Tasks Manager", [:view_foreman_tasks, :edit_foreman_tasks]
        role "Tasks Reader", [:view_foreman_tasks]

        widget 'foreman_tasks/tasks/dashboard/tasks_status', :sizex=>6, :sizey=>1, :name=> N_('Tasks Status table')
        widget 'foreman_tasks/tasks/dashboard/latest_tasks_in_error_warning', :sizex=>6, :sizey=>1,:name=> N_('Tasks in Error/Warning')
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

    initializer "foreman_tasks.test_exceptions" do |app|
      if defined? ActiveSupport::TestCase
        require 'foreman_tasks/test_extensions'
      end
    end

    initializer "foreman_tasks.load_app_instance_data" do |app|
      ForemanTasks::Engine.paths['db/migrate'].existent.each do |path|
        app.config.paths['db/migrate'] << path
      end
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

    config.to_prepare do
      ForemanTasks.dynflow.eager_load_actions!

      Authorizer.send(:include, AuthorizerExt)
    end


    rake_tasks do
      %w[dynflow.rake test.rake export_tasks.rake cleanup.rake].each do |rake_file|
        full_path = File.expand_path("../tasks/#{rake_file}", __FILE__)
        load full_path if File.exists?(full_path)
      end
    end
  end

  def self.table_name_prefix
    "foreman_tasks_"
  end

  def use_relative_model_naming
    true
  end
end
