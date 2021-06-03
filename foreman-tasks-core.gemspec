$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require "foreman_tasks_core/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "foreman-tasks-core"
  s.version     = ForemanTasksCore::VERSION
  s.license     = 'GPL-3.0'
  s.authors     = ["Ivan Nečas"]
  s.email       = ["inecas@redhat.com"]
  s.homepage    = "https://github.com/theforeman/foreman-tasks"
  s.summary     = "Common code used both at Forman and Foreman proxy regarding tasks"
  s.description = <<-DESC
Common code used both at Forman and Foreman proxy regarding tasks
  DESC

  s.files = Dir['lib/foreman_tasks_core/**/*'] +
            ['lib/foreman_tasks_core.rb', 'LICENSE']

  s.add_dependency "dynflow", '>= 1.2.0'
  s.add_dependency "smart_proxy_dynflow", '>= 0.4.0'
end
