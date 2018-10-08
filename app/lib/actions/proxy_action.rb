module Actions
  class ProxyAction < Base
    include ::Dynflow::Action::Cancellable

    middleware.use ::Actions::Middleware::HideSecrets

    execution_plan_hooks.use :clean_remote_task, :on => :stopped
    execution_plan_hooks.use :wipe_secrets!, :on => :stopped

    class CallbackData
      attr_reader :data

      def initialize(data)
        @data = data
      end
    end

    class ProxyActionMissing < RuntimeError
      def backtrace
        []
      end
    end

    class ProxyActionStopped; end

    def plan(proxy, klass, options)
      options[:connection_options] ||= {}
      default_connection_options.each { |key, value| options[:connection_options][key] ||= value }
      plan_self(options.merge(:proxy_url => proxy.url, :proxy_action_name => klass.to_s))
    end

    def run(event = nil)
      with_connection_error_handling(event) do |event|
        case event
        when nil
          if remote_task
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
        when ProxyActionMissing
          on_proxy_action_missing
        when ProxyActionStopped
          on_proxy_action_stopped
        else
          raise "Unexpected event #{event.inspect}"
        end
      end
    end

    def remote_task
      @remote_task ||= ForemanTasks::RemoteTask.find_by(:execution_plan_id => execution_plan_id, :step_id => run_step_id)
    end

    def trigger_proxy_task
      suspend do |_suspended_action|
        if with_batch_triggering?
          prepare_for_batch_triggering
        else
          remote_task = ::ForemanTasks::RemoteTask.new(:execution_plan_id => execution_plan_id,
                                                       :proxy_url => input[:proxy_url],
                                                       :step_id => run_step_id)
          remote_task.save!
          remote_task.trigger(proxy_action_name, proxy_input)
          output[:proxy_task_id] = remote_task.remote_task_id
        end
      end
    end

    def proxy_input(task_id = task.id, step_id = run_step_id)
      input.merge(:callback => { :task_id => task.id,
                                 :step_id => run_step_id })
    end

    def check_task_status
      response = proxy.status_of_task(proxy_task_id)
      if %w[stopped paused].include? response['state']
        if response['result'] == 'error'
          raise ::Foreman::Exception, _('The smart proxy task %s failed.') % proxy_task_id
        else
          on_data(response['actions'].find { |block_action| block_action['class'] == proxy_action_name }['output'])
        end
      else
        suspend
      end
    end

    def cancel_proxy_task
      if output[:cancel_sent]
        error! ForemanTasks::Task::TaskCancelledException.new(_('Cancel enforced: the task might be still running on the proxy'))
      else
        proxy.cancel_task(proxy_task_id)
        output[:cancel_sent] = true
        suspend
      end
    end

    def abort_proxy_task
      proxy.cancel_task(proxy_task_id)
      error! ForemanTasks::Task::TaskCancelledException.new(_('Task aborted: the task might be still running on the proxy'))
    end

    def on_resume
      # TODO: add logic to load the data from the external action
      suspend
    end

    # @override to put custom logic on event handling
    def on_data(data)
      output[:proxy_output] = data
    end

    # Removes the :secrets key from the action's input and output and saves the action
    def wipe_secrets!(_execution_plan)
      input.delete(:secrets)
      output.delete(:secrets)
      world.persistence.save_action(execution_plan_id, self)
    end

    def on_proxy_action_missing
      error! ProxyActionMissing.new(_('Proxy task gone missing from the smart proxy'))
    end

    def on_proxy_action_stopped
      check_task_status
    end

    # @override String name of an action to be triggered on server
    def proxy_action_name
      input[:proxy_action_name]
    end

    def proxy
      ProxyAPI::ForemanDynflow::DynflowProxy.new(:url => input[:proxy_url])
    end

    def proxy_output(live = false)
      if output.key?(:proxy_output) || state == :error
        output.fetch(:proxy_output, {})
      elsif live && proxy_task_id
        proxy_data = proxy.status_of_task(proxy_task_id)['actions'].detect { |action| action['class'] == proxy_action_name }
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

    def default_connection_options
      # Fails if the plan is not finished within 60 seconds from the first task trigger attempt on the smart proxy
      # If the triggering fails, it retries 3 more times with 15 second delays
      { :retry_interval => Setting['foreman_tasks_proxy_action_retry_interval'] || 15,
        :retry_count    => Setting['foreman_tasks_proxy_action_retry_count'] || 4,
        :proxy_batch_triggering => true }
    end

    def with_batch_triggering?
      input.fetch(:connection_options, {}).fetch(:proxy_batch_triggering, false)
    end

    def clean_remote_task(*_args)
      remote_task.destroy! if remote_task
    end

    private

    def failed_proxy_tasks
      metadata[:failed_proxy_tasks] ||= []
    end

    def with_connection_error_handling(event = nil)
      yield event
    rescue ::RestClient::Exception, Errno::ECONNREFUSED, Errno::EHOSTUNREACH, Errno::ETIMEDOUT => e
      if event.class == CallbackData
        raise e
      else
        handle_connection_exception(e, event)
      end
    end

    def format_exception(exception)
      { :proxy_task_id => proxy_task_id,
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

    def prepare_for_batch_triggering
      ::ForemanTasks::RemoteTask.new(:execution_plan_id => execution_plan_id, :state => 'pending',
                                     :proxy_url => input[:proxy_url], :step_id => run_step_id).save!
    end

    def proxy_task_id
      output[:proxy_task_id] ||= remote_task.remote_task_id
    end
  end
end
