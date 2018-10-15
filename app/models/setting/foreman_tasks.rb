class Setting::ForemanTasks < Setting
  def self.load_defaults
    # Check the table exists
    return unless super

    transaction do
      [
        set('foreman_tasks_sync_task_timeout', N_('Number of seconds to wait for synchronous task to finish.'), 120),
        set('dynflow_allow_dangerous_actions', N_('Allow unlocking actions which can have dangerous consequences.'), false),
        set('dynflow_enable_console', N_('Enable the dynflow console (/foreman_tasks/dynflow) for debugging'), true),
        set('dynflow_console_require_auth', N_('Require user to be authenticated as user with admin rights when accessing dynflow console'), true),
        set('foreman_tasks_proxy_action_retry_count', N_('Number of attempts to start a task on the smart proxy before failing'), 4),
        set('foreman_tasks_proxy_action_retry_interval', N_('Time in seconds between retries'), 15),
        set('foreman_tasks_proxy_batch_trigger', N_('Allow triggering tasks on the smart proxy in batches'), true)
      ].each { |s| create! s.update(:category => 'Setting::ForemanTasks') }
    end

    true
  end
end
