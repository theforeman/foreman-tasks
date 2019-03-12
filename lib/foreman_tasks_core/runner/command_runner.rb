require 'io/wait'
require 'pty'
require 'foreman_tasks_core/runner/command'

module ForemanTasksCore
  module Runner
    class CommandRunner < Base
      include Command
    end
  end
end
