object @recurring_logic

extends 'foreman_tasks/api/recurring_logics/base'

child :tasks => :tasks do
  extends 'foreman_tasks/api/tasks/show'
end
