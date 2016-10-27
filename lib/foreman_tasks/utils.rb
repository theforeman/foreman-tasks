require 'fileutils'

module ForemanTasks
  class Utils

    class << self

      def dynflow_world(options)
        require 'dynflow'
        config = ::Dynflow::Config.new.tap do |config|
          config.logger_adapter      = ::Dynflow::LoggerAdapters::Simple.new $stdout
          config.pool_size           = 5
          config.persistence_adapter = ::Dynflow::PersistenceAdapters::Sequel.new options[:connection_string]
          config.executor            = false
          config.connector           = Proc.new { |world| Dynflow::Connectors::Database.new(world) }
          config.auto_execute        = false
        end
        ::Dynflow::World.new(config)
      end

      def foreman_tasks_world(options)
        app_file = File.expand_path('./config/application', options[:foreman_root])
        require app_file
        foreman_env_file = File.expand_path("./config/environment.rb", options[:foreman_root])
        require foreman_env_file

        ForemanTasks.dynflow.world
      end

      def get_connection_string
        settings_file = '/etc/smart_proxy_dynflow_core/settings.yml'
        raise "#{settings_file} is not readable, unable to determine CONNECTION_STRING" unless File.redable?(settings_file)
        require 'yaml'
        db = YAML.load(File.read(settings_file))[:database]
        raise "CONNECTINO_STRING has to be set" if str.db.nil?
        'sqlite3://' + db          
      end

    end

    def initialize(world, options)
      @world      = world
      @format     = options[:format]
      @plan_uuids = options[:plan_uuids]
      @paused     = options[:paused]
      @dir        = options[:dir]
    end

    def export_plans
      plans = load_plans
      path = File.join(@dir, "task-export-#{Time.now.strftime('%Y-%m-%d.%H:%M:%S')}.tar.gz")
      content = if @format == :json
                  ::Dynflow::Exporters::Tar.full_json_export(plans)
                else
                  ::Dynflow::Exporters::Tar.full_html_export(plans)
                end
      File.write(path, content)
    end

    private

    def has_targets?
      @paused || !@plan_uuids.empty?
    end

    def load_plans
      has_targets? ? load_targeted : load_all
    end

    def load_all
      @world.persistence.find_execution_plans({})
    end

    def load_targeted
      plans                = Hash.new([])
      plans[:paused]       = load_paused if @paused
      ids                  = plans[:paused].map(&:id)
      plans[:by_plan_uuid] = @world.persistence.find_execution_plans(:id => @plan_uuids - ids) unless @plan_uuids.empty?

      plans.values_at(:by_plan_uuid, :paused).flatten.compact.uniq
    end

    def load_paused
      @world.persistence.find_execution_plans(filters: {'state' => 'paused'})
    end
  end
end

