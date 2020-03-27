class Setting::ForemanTasks < Setting
  def self.default_settings
    [
      set('foreman_tasks_sync_task_timeout', N_('Number of seconds to wait for synchronous task to finish.'), 120),
      set('dynflow_allow_dangerous_actions', N_('Allow unlocking actions which can have dangerous consequences.'), false),
      set('dynflow_enable_console', N_('Enable the dynflow console (/foreman_tasks/dynflow) for debugging'), true),
      set('dynflow_console_require_auth', N_('Require user to be authenticated as user with admin rights when accessing dynflow console'), true),
      set('foreman_tasks_proxy_action_retry_count', N_('Number of attempts to start a task on the smart proxy before failing'), 4),
      set('foreman_tasks_proxy_action_retry_interval', N_('Time in seconds between retries'), 15),
      set('foreman_tasks_proxy_batch_trigger', N_('Allow triggering tasks on the smart proxy in batches'), true),
      set('foreman_tasks_proxy_batch_size', N_('Number of tasks which should be sent to the smart proxy in one request, if foreman_tasks_proxy_batch_trigger is enabled'), 100),
      set('foreman_tasks_troubleshooting_url',
          N_('Url pointing to the task troubleshooting documentation. '\
             'It should contain %{label} placeholder, that will be replaced with normalized task label '\
             '(restricted to only alphanumeric characters)). %{version} placeholder is also available.'),
          nil),
      set('foreman_tasks_polling_intervals',
          N_('An array of polling intervals to use instead of the predefined polling intervals. '\
             'This can be used to prevent polling too frequently for long running tasks.'),
          [],
          N_("Polling intervals"),
          nil,
          { :type => 'array' })
    ]
  end

  def self.load_defaults
    Setting::BLANK_ATTRS.push('foreman_tasks_troubleshooting_url', 'foreman_tasks_polling_intervals')
    super
  end
end
