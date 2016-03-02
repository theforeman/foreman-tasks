view_permission = Permission.where(:name => :view_foreman_tasks, :resource_type => ForemanTasks::Task.name).first

# the anonymous role was renamed to default in
# https://github.com/theforeman/foreman/pull/3239
default_role = Role.respond_to?(:default) ? Role.default : Role.anonymous
# the view_permissions can be nil in tests: skipping in that case
if view_permission && !default_role.permissions.include?(view_permission)
  default_role.filters.create(:search => 'owner.id = current_user') do |filter|
    filter.filterings.build { |f| f.permission = view_permission }
  end
end
