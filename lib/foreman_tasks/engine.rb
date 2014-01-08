module ForemanTasks
  class Engine < ::Rails::Engine
    engine_name "foreman_tasks"

    initializer 'foreman_tasks.register_plugin', :after=> :finisher_hook do |app|
      Foreman::Plugin.register :"foreman-tasks" do
        requires_foreman '> 1.3'
        divider :top_menu, :parent => :monitor_menu, :after => :audits
        menu :top_menu, :tasks,
          :url_hash => {:controller => 'foreman_tasks/tasks', :action => :index},
          :caption  => N_('Tasks'),
          :parent   => :monitor_menu
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
      initializer "foreman_tasks.dynflow_initialize" do |app|
        ForemanTasks.dynflow.require!
      end

      config.to_prepare do
        ::Api::V2::HostsController.send :include, ForemanTasks::Concerns::HostsControllerExtension
        ::Host::Base.send :include, ForemanTasks::Concerns::HostActionSubject
        ::Architecture.send :include, ForemanTasks::Concerns::ArchitectureActionSubject
      end
    end

    initializer "foreman_tasks.initialize_dynflow", :after=> :finisher_hook do
      ForemanTasks.dynflow.initialize!
    end

  end

  def self.table_name_prefix
    "foreman_tasks_"
  end

  def use_relative_model_naming
    true
  end
end
