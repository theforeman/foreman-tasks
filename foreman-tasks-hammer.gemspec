# -*- coding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "foreman_tasks/hammer/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "foreman-tasks-hammer"
  s.version     = ForemanTasks::Hammer::VERSION
  s.authors     = ["Ivan Nečas"]
  s.email       = ["inecas@redhat.com"]
  s.homepage    = "https://github.com/iNecas/foreman-tasks"
  s.summary     = "Foreman CLI plugin for showing tasks information for resoruces and users"
  s.description = <<DESC
Contains the code for showing of the tasks (results and progress) in the Hammer CLI.
DESC

  s.files = Dir["lib/foreman_tasks/hammer/**/*", "MIT-LICENSE", "README.md"]

  s.add_dependency "powerbar"
  s.add_dependency "hammer_cli_foreman"
end
