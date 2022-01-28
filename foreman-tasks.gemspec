$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require "foreman_tasks/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "foreman-tasks"
  s.version     = ForemanTasks::VERSION
  s.license     = 'GPL-3.0'
  s.authors     = ["Ivan Nečas"]
  s.email       = ["inecas@redhat.com"]
  s.homepage    = "https://github.com/theforeman/foreman-tasks"
  s.summary     = "Foreman plugin for showing tasks information for resources and users"
  s.description = <<-DESC
The goal of this plugin is to unify the way of showing task statuses across the Foreman instance.
It defines Task model for keeping the information about the tasks and Lock for assigning the tasks
to resources. The locking allows dealing with preventing multiple colliding tasks to be run on the
same resource. It also optionally provides Dynflow infrastructure for using it for managing the tasks.
  DESC

  s.files = `git ls-files`.split("\n").reject do |file|
    file.end_with?("test.rake") || file == '.packit.yaml'
  end

  s.test_files = `git ls-files test`.split("\n")
  s.extra_rdoc_files = Dir['README*', 'LICENSE']

  s.add_dependency "dynflow", '>= 1.9.0'
  s.add_dependency 'fugit', '~> 1.8'
  s.add_dependency "get_process_mem" # for memory polling
  s.add_dependency "sinatra" # for Dynflow web console

  s.add_development_dependency 'factory_bot_rails', '~> 4.8.0'
  s.add_development_dependency 'sqlite3'
end
