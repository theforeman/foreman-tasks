module Actions
  module Foreman
    module Architecture
      class Update < Actions::EntryAction

        def plan(architecture)
          action_subject(architecture, :changes => architecture.changes)
        end

        def humanized_name
          _("Update architecture")
        end

        def humanized_input
          input[:architecture] && input[:architecture][:name]
        end

      end
    end
  end
end
