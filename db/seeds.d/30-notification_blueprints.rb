blueprints = [
  {
    group: N_('Tasks'),
    name: 'tasks_paused_admin',
    message: "DYNAMIC",
    level: 'warning',
    actions:
      {
        links:
          [
            href: "/foreman_tasks/tasks?search=#{CGI.escape('state=paused')}",
            title: N_('List of tasks')
          ]
      }
  },

  {
    group: N_('Tasks'),
    name: 'tasks_paused_owner',
    message: "The task '%{subject}' got paused",
    level: 'warning',
    actions:
      {
        links:
          [
            path_method: :foreman_tasks_task_path,
            title: N_('Task Details')
          ]
      }
  }
]

blueprints.each { |blueprint| UINotifications::Seed.new(blueprint).configure }
