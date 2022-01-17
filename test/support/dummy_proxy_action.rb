require 'securerandom'

module Support
  class DummyProxyAction < Actions::ProxyAction
    class DummyProxyVersion
      attr_reader :version

      def initialize(version)
        @version = { 'version' => version }
      end
    end

    class DummyProxy
      attr_reader :log, :task_triggered, :uuid

      def initialize
        @log = Hash.new { |h, k| h[k] = [] }
        @task_triggered = Concurrent::Promises.resolvable_future
        @uuid = SecureRandom.uuid
      end

      def trigger_task(*args)
        @log[:trigger_task] << args
        @task_triggered.fulfill(true)
        { 'task_id' => @uuid, 'result' => 'success' }
      end

      def cancel_task(*args)
        @log[:cancel_task] << args
      end

      def url
        'proxy.example.com'
      end

      def statuses
        { version: DummyProxyVersion.new('1.21.0') }
      end

      def launch_tasks(operation, args = {})
        @log[:trigger_task] << [operation, args]
        @task_triggered.fulfill(true)
        { 'task_id' => @uuid, 'result' => 'success', 'parent' => { 'task_id' => @uuid } }
      end
    end

    class ProxySelector < ::ForemanTasks::ProxySelector
      def available_proxies
        { :global => [DummyProxyAction.proxy] }
      end
    end

    def proxy_operation_name
      'support'
    end

    def proxy
      self.class.proxy
    end

    def task
      super
    rescue ActiveRecord::RecordNotFound
      ForemanTasks::Task::DynflowTask.new.tap { |task| task.id = proxy.uuid }
    end

    class << self
      attr_reader :proxy
    end

    def self.reset
      @proxy = DummyProxy.new
    end
  end
end
