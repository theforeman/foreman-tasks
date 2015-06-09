module ForemanTasks
  class WidgetManager
    DEFAULT_WIDGETS = [
      {:template=>'foreman_tasks/tasks/dashboard/tasks_status', :sizex=>6, :sizey=>1, :name=> N_('Tasks Status table')},
      {:template=>'foreman_tasks/tasks/dashboard/latest_tasks_in_error_warning', :sizex=>6, :sizey=>1,:name=> N_('Tasks in Error/Warning')}
    ]

    def self.register_widgets
      if ForemanTasks.dynflow.required?
        DEFAULT_WIDGETS.each do |widget|
          Dashboard::Manager.register_default_widget(widget)
        end
      end
    end
  end
end
