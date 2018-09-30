module Actions
  module Foreman
    module Host
      class ImportFacts < Actions::EntryAction
        def resource_locks
          :import_facts
        end

        def plan(_host_type, host_name, facts, certname, proxy_id)
          facts['domain'].try(:downcase!)
          host = if SETTINGS[:version].short > '1.16'
                   ::Host::Base.import_host(host_name, certname)
                 else
                   # backwards compatibility
                   ::Host::Managed.import_host(host_name, facts['_type'], certname, proxy_id)
                 end
          host.save(:validate => false) if host.new_record?
          action_subject(host, :facts => facts.to_unsafe_h, :proxy_id => proxy_id)
          if host.build?
            ::Foreman::Logging.logger('foreman-tasks').info "Skipping importing of facts for #{host.name} because it's in build mode"
          else
            plan_self
          end
        end

        def run
          ::User.as :admin do
            host_attrs = input[:host] || input[:managed]
            host = ::Host.find(host_attrs[:id])
            state = host.import_facts(input[:facts], proxy)
            output[:state] = state
          end
        rescue ::Foreman::Exception => e
          # This error is what is thrown by Host#ImportHostAndFacts when
          # the Host is in the build state. This can be refactored once
          # issue #3959 is fixed.
          raise e unless e.code == 'ERF51-9911'
        end

        def proxy
          SmartProxy.find_by(id: input[:proxy_id]) if input[:proxy_id].present?
        end

        def rescue_strategy
          ::Dynflow::Action::Rescue::Skip
        end

        def humanized_name
          _('Import facts')
        end

        def humanized_input
          input[:host] && input[:host][:name]
        end

        # default value for cleaning up the tasks, it can be overriden by settings
        def self.cleanup_after
          '30d'
        end
      end
    end
  end
end
