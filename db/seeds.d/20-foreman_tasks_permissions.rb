view_permission = Permission.where(:name => :view_foreman_tasks, :resource_type => ForemanTasks::Task.name).first

# the view_permissions can be nil in tests: skipping in that case
if view_permission && !Role.anonymous.permissions.include?(view_permission)
  Role.anonymous.filters.create(:search => 'owner.id = current_user') do |filter|
    filter.filterings.build { |f| f.permission = view_permission }
  end
end
