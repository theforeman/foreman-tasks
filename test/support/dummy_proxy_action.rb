require 'securerandom'

module Support
  class DummyProxyAction < Actions::ProxyAction
    class DummyProxy
      attr_reader :log, :task_triggered, :uuid

      def initialize
        @log = Hash.new { |h, k| h[k] = [] }
        @task_triggered = Concurrent.future
        @uuid = SecureRandom.uuid
      end

      def trigger_task(*args)
        @log[:trigger_task] << args
        @task_triggered.success(true)
        { 'task_id' => @uuid }
      end

      def cancel_task(*args)
        @log[:cancel_task] << args
      end

      def url
        'proxy.example.com'
      end
    end

    class ProxySelector < ::ForemanTasks::ProxySelector
      def available_proxies
        { :global => [DummyProxyAction.proxy] }
      end
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
