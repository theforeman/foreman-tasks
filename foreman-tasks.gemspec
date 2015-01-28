# -*- coding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "foreman_tasks/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "foreman-tasks"
  s.version     = ForemanTasks::VERSION
  s.authors     = ["Ivan Nečas"]
  s.email       = ["inecas@redhat.com"]
  s.homepage    = "https://github.com/theforeman/foreman-tasks"
  s.summary     = "Foreman plugin for showing tasks information for resoruces and users"
  s.description = <<DESC
The goal of this plugin is to unify the way of showing task statuses across the Foreman instance.
It defines Task model for keeping the information about the tasks and Lock for assigning the tasks
to resources. The locking allows dealing with preventing multiple colliding tasks to be run on the
same resource. It also optionally provides Dynflow infrastructure for using it for managing the tasks.
DESC

  s.files = Dir["{app,bin,config,db,deploy,lib}/**/*", "LICENSE", "README.md"].reject do |file|
    file.start_with? "lib/foreman_tasks/hammer"
  end
  s.test_files = Dir["test/**/*"]

  s.add_dependency "dynflow", '>= 0.7.2'
  s.add_dependency "sequel" # for Dynflow process persistence
  s.add_dependency "sinatra" # for Dynflow web console
  s.add_dependency "daemons" # for running remote executor
end
