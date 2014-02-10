module ForemanTasks
  module Hammer
    class Task < HammerCLI::AbstractCommand
      class ProgressCommand < HammerCLIForeman::ReadCommand

        include ForemanTasks::Hammer::Helper

        command_name "progress"
        desc "Show the progress of the task"
        option '--id', "UUID", "UUID of the task", :required => true

        def execute
          task_progress(option_id)
          HammerCLI::EX_OK
        end

      end

      autoload_subcommands
    end

    HammerCLI::MainCommand.subcommand 'task', "Tasks related actions.", Task
  end
end

