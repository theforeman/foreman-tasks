module ForemanTasks
  class Engine < ::Rails::Engine
    engine_name "foreman_tasks"

    initializer 'foreman_tasks.register_plugin', :after=> :finisher_hook do |app|
      Foreman::Plugin.register :tasks do
        menu :admin_menu, :tasks,
            :url_hash => {:controller => 'foreman_tasks/tasks', :action => :index},
            :caption => _('Tasks'),
            :parent => :administer_menu
      end
    end

    initializer "foreman_tasks.load_app_instance_data" do |app|
      app.config.paths['db/migrate'] += ForemanTasks::Engine.paths['db/migrate'].existent
    end
  end

  def self.table_name_prefix
    "foreman_tasks_"
  end

  def use_relative_model_naming
    true
  end
end
