module Actions
  module Foreman
    module Architecture
      class Create < Actions::EntryAction

        def plan(architecture)
          action_subject(architecture, :changes => architecture.changes)
        end

        def humanized_name
          _("Create architecture")
        end

        def humanized_input
          input[:architecture] && input[:architecture][:name]
        end

        def cli_example
          return unless input[:architecture]
        <<-EXAMPLE
hammer architecture create --id '#{task_input[:architecture][:id]}' \
--name '#{task_input[:architecture][:name]}'
        EXAMPLE
        end

      end
    end
  end
end
