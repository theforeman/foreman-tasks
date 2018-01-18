module Actions
  class ProxyAction < Base
    include ::Dynflow::Action::Cancellable
    include ::Dynflow::Action::Timeouts

    middleware.use ::Actions::Middleware::HideSecrets

    class CallbackData
      attr_reader :data

      def initialize(data)
        @data = data
      end
    end

    def plan(proxy, klass, options)
      options[:connection_options] ||= {}
      default_connection_options.each { |key, value| options[:connection_options][key] ||= value }
      plan_self(options.merge(:proxy_url => proxy.url, :proxy_action_name => klass.to_s))
    end

    def run(event = nil)
      with_connection_error_handling(event) do |event|
        case event
        when nil
          if output[:proxy_task_id]
            on_resume
          else
            trigger_proxy_task
          end
          suspend
        when ::Dynflow::Action::Skip
          # do nothing
        when ::Dynflow::Action::Cancellable::Cancel
          cancel_proxy_task
        when ::Dynflow::Action::Cancellable::Abort
          abort_proxy_task
        when CallbackData
          on_data(event.data)
        when ::Dynflow::Action::Timeouts::Timeout
          check_task_status
        else
          raise "Unexpected event #{event.inspect}"
        end
      end
    end

    def trigger_proxy_task
      suspend do |_suspended_action|
        set_timeout! unless timeout_set?
        response = proxy.trigger_task(proxy_action_name,
                                      input.merge(:callback => { :task_id => task.id,
                                                                 :step_id => run_step_id }))
        output[:proxy_task_id] = response['task_id']
      end
    end

    def check_task_status
      if output[:proxy_task_id]
        response = proxy.status_of_task(output[:proxy_task_id])
        if %w[stopped paused].include? response['state']
          if response['result'] == 'error'
            raise ::Foreman::Exception, _('The smart proxy task %s failed.') % output[:proxy_task_id]
          else
            on_data(response['actions'].find { |block_action| block_action['class'] == proxy_action_name }['output'])
          end
        else
          suspend
        end
      else
        process_timeout
      end
    end

    def cancel_proxy_task
      if output[:cancel_sent]
        error! ForemanTasks::Task::TaskCancelledException.new(_('Cancel enforced: the task might be still running on the proxy'))
      else
        proxy.cancel_task(output[:proxy_task_id])
        output[:cancel_sent] = true
        suspend
      end
    end

    def abort_proxy_task
      proxy.cancel_task(output[:proxy_task_id])
      error! ForemanTasks::Task::TaskCancelledException.new(_('Task aborted: the task might be still running on the proxy'))
    end

    def on_resume
      # TODO: add logic to load the data from the external action
      suspend
    end

    # @override to put custom logic on event handling
    def on_data(data)
      output[:proxy_output] = data
      wipe_secrets!
    end

    def wipe_secrets!
      input.delete(:secrets)
      output.delete(:secrets)
    end

    # @override String name of an action to be triggered on server
    def proxy_action_name
      input[:proxy_action_name]
    end

    def proxy
      ProxyAPI::ForemanDynflow::DynflowProxy.new(:url => input[:proxy_url])
    end

    def proxy_output(live = false)
      if output.key?(:proxy_output)
        output.fetch(:proxy_output) || {}
      elsif live && output[:proxy_task_id]
        proxy_data = proxy.status_of_task(output[:proxy_task_id])['actions'].detect { |action| action['class'] == proxy_action_name }
        proxy_data.fetch('output', {})
      else
        {}
      end
    end

    # The proxy action is able to contribute to continuous output
    def fill_continuous_output(continuous_output)
      failed_proxy_tasks.each do |failure_data|
        message = _('Initialization error: %s') %
                  "#{failure_data[:exception_class]} - #{failure_data[:exception_message]}"
        continuous_output.add_output(message, 'debug', failure_data[:timestamp])
      end
    end

    def proxy_output=(output)
      output[:proxy_output] = output
    end

    def metadata
      output[:metadata] ||= {}
      output[:metadata]
    end

    def metadata=(thing)
      output[:metadata] ||= {}
      output[:metadata] = thing
    end

    def timeout_set?
      !metadata[:timeout].nil?
    end

    def set_timeout!
      time = Time.zone.now + input[:connection_options][:timeout]
      schedule_timeout(time)
      metadata[:timeout] = time.to_s
    end

    def default_connection_options
      # Fails if the plan is not finished within 60 seconds from the first task trigger attempt on the smart proxy
      # If the triggering fails, it retries 3 more times with 15 second delays
      { :retry_interval => Setting['foreman_tasks_proxy_action_retry_interval'] || 15,
        :retry_count    => Setting['foreman_tasks_proxy_action_retry_count'] || 4,
        :timeout        => Setting['foreman_tasks_proxy_action_start_timeout'] || 60 }
    end

    private

    def failed_proxy_tasks
      metadata[:failed_proxy_tasks] ||= []
    end

    def with_connection_error_handling(event = nil)
      yield event
    rescue ::RestClient::Exception, Errno::ECONNREFUSED, Errno::EHOSTUNREACH, Errno::ETIMEDOUT => e
      if event.class == CallbackData || event == ::Dynflow::Action::Timeouts::Timeout
        raise e
      else
        handle_connection_exception(e, event)
      end
    end

    def format_exception(exception)
      { :proxy_task_id => output[:proxy_task_id],
        :exception_class => exception.class.name,
        :exception_message => exception.message,
        :timestamp => Time.now.to_f }
    end

    def handle_connection_exception(exception, event = nil)
      options = input[:connection_options]
      failed_proxy_tasks << format_exception(exception)
      output[:proxy_task_id] = nil
      if failed_proxy_tasks.count < options[:retry_count]
        suspend do |suspended_action|
          @world.clock.ping suspended_action,
                            Time.zone.now + options[:retry_interval],
                            event
        end
      else
        raise exception
      end
    end
  end
end
