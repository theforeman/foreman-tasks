module ForemanTasks
  module Concerns
    module HostActionSubject
      extend ActiveSupport::Concern
      include ForemanTasks::Concerns::ActionSubject

      def action_input_key
        "host"
      end

      def available_locks
        [:read, :write, :import_facts]
      end

      module ClassMethods
        # TODO: This should get into the Foreman core, extracting the
        # +importHostAndFacts+ method into two
        def importHost(hostname, certname, proxy_id = nil)
          raise(::Foreman::Exception.new("Invalid Hostname, must be a String")) unless hostname.is_a?(String)

          # downcase everything
          hostname.try(:downcase!)
          certname.try(:downcase!)

          host = certname.present? ? Host.where(:certname => certname).first : nil
          host ||= Host.where(:name => hostname).first
          host ||= Host.new(:name => hostname, :certname => certname) if Setting[:create_new_host_when_facts_are_uploaded]
          if host
            # if we were given a certname but found the Host by hostname we should update the certname
            host.certname = certname if certname.present?
            # if proxy authentication is enabled and we have no puppet proxy set, use it.
            host.puppet_proxy_id ||= proxy_id
            host.save(:validate => false)
            return host
          else
            return
          end
        end
      end
    end
  end
end
