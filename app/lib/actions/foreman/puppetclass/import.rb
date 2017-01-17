module Actions
  module Foreman
    module Puppetclass
      class Import < Actions::EntryAction
        def resource_locks
          :import_puppetclasses
        end

        def run
          output[:results] = ::PuppetClassImporter.new.obsolete_and_new(input[:changed])
        end

        def rescue_strategy
          ::Dynflow::Action::Rescue::Skip
        end

        def humanized_name
          _('Import Puppet classes')
        end

        # default value for cleaning up the tasks, it can be overriden by settings
        def self.cleanup_after
          '30d'
        end
      end
    end
  end
end
