module Actions
  class ProxyAction < Base
    include ::Dynflow::Action::Cancellable

    middleware.use ::Actions::Middleware::HideSecrets

    execution_plan_hooks.use :clean_remote_task, :on => :stopped
    execution_plan_hooks.use :wipe_secrets!, :on => :stopped

    class CallbackData
      attr_reader :data, :meta

      def initialize(data, meta = {})
        @data = data
        @meta = meta
      end
    end

    class ProxyActionMissing < RuntimeError
      def backtrace
        []
      end
    end

    class ProxyActionStopped < RuntimeError
      def backtrace
        []
      end
    end

    ProxyActionStoppedEvent = ::Algebrick.type do
      fields! exception: type { variants NilClass, Exception }
    end

    def plan(proxy, options)
      plan_self(options)
      prepare_remote_task(proxy).save!
    end

    def run(event = nil)
      case event
      when nil
        start_or_resume
      when ::Dynflow::Action::Skip
        # do nothing
      when ::Dynflow::Action::Cancellable::Cancel
        cancel_proxy_task
      when ::Dynflow::Action::Cancellable::Abort
        abort_proxy_task
      when CallbackData
        on_data(event.data, event.meta)
      when ProxyActionMissing
        on_proxy_action_missing
      when ProxyActionStoppedEvent
        on_proxy_action_stopped(event)
      else
        raise "Unexpected event #{event.inspect}"
      end
    end

    def remote_task
      @remote_task ||= ForemanTasks::RemoteTask.find_by(:execution_plan_id => execution_plan_id, :step_id => run_step_id)
    end

    def proxy_input(task_id = task.id)
      input.merge(:callback => { :task_id => task_id,
                                 :step_id => run_step_id })
    end

    def check_task_status
      response = proxy.status_of_task(proxy_task_id)
      if %w[stopped paused].include? response['state']
        if response['result'] == 'error'
          raise ::Foreman::Exception, _('The smart proxy task %s failed.') % proxy_task_id
        else
          on_data(get_proxy_data(response))
        end
      else
        suspend
      end
    rescue RestClient::NotFound
      on_proxy_action_missing
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
    def on_data(data, meta = {})
      action_logger.info(_('Event delivered by request %{request_id}') % { :request_id => meta[:request_id] }) if meta[:request_id].present?
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

    def on_proxy_action_stopped(event)
      if event.exception
        error! ProxyActionStopped.new(_('Failed to trigger task on the smart proxy: ') + event.exception.message)
      else
        check_task_status
      end
    end

    # @override String name of an action to be triggered on server
    def proxy_action_name
      input[:proxy_action_name]
    end

    # @override String name of a operation to be triggered on server
    def proxy_operation_name
      input[:proxy_operation_name]
    end

    def proxy
      ProxyAPI::ForemanDynflow::DynflowProxy.new(:url => input[:proxy_url])
    end

    def proxy_output(live = false)
      if output.key?(:proxy_output) || state == :error
        output.fetch(:proxy_output, {})
      elsif live && proxy_task_id
        response = proxy.status_of_task(proxy_task_id)
        get_proxy_data(response)
      else
        {}
      end
    end

    # The proxy action is able to contribute to continuous output
    def fill_continuous_output(continuous_output)
      # TODO? Should this be removed completely?
    end

    def proxy_output=(output)
      output[:proxy_output] = output
    end

    def metadata
      output[:metadata] ||= {}
      output[:metadata]
    end

    def clean_remote_task(*_args)
      remote_task.destroy! if remote_task
    end

    private

    def start_or_resume
      on_resume if remote_task
      suspend
    end

    def get_proxy_data(response)
      response['actions'].detect { |action| action.fetch('input', {})['task_id'] == task.id }
                         .try(:fetch, 'output', {}) || {}
    end

    def prepare_remote_task(proxy)
      ::ForemanTasks::RemoteTask.new(:execution_plan_id => execution_plan_id,
                                     :proxy_url => proxy.url,
                                     :step_id => run_step_id,
                                     :operation => proxy_operation_name,
                                     :state => 'new')
    end

    def proxy_task_id
      output[:proxy_task_id] || remote_task.try(:remote_task_id) || @execution_plan_id
    end
  end
end
