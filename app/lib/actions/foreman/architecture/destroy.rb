module Actions
  module Foreman
    module Architecture
      class Destroy < Actions::EntryAction

        def plan(architecture)
          action_subject(architecture)
        end

        def humanized_name
          _("Delete architecture")
        end

        def humanized_input
          input[:architecture] && input[:architecture][:name]
        end

        def cli_example
          return unless input[:architecture]
        <<-EXAMPLE
hammer architecture delete --id '#{task_input[:architecture][:id]}'
        EXAMPLE
        end

      end
    end
  end
end
