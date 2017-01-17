module ForemanTasks
  module Concerns
    module HostActionSubject
      extend ActiveSupport::Concern
      include ForemanTasks::Concerns::ActionSubject

      def action_input_key
        'host'
      end

      def available_locks
        [:read, :write, :import_facts]
      end

      module ClassMethods
        # TODO: This should get into the Foreman core, extracting the
        # +importHostAndFacts+ method into two
        def import_host(hostname, certname, facts, proxy_id = nil)
          raise Foreman::Exception, 'Invalid Facts, must be a Hash' unless facts.is_a?(Hash)
          raise Foreman::Exception, 'Invalid Hostname, must be a String' unless hostname.is_a?(String)

          # downcase everything
          hostname.try(:downcase!)
          certname.try(:downcase!)

          host = certname.present? ? Host.find_by(certname: certname) : nil
          host ||= Host.find_by name: hostname
          host ||= Host.new(:name => hostname, :certname => certname) if Setting[:create_new_host_when_facts_are_uploaded]

          return Host.new if host.nil?
          # if we were given a certname but found the Host by hostname we should update the certname
          host.certname = certname if certname.present?
          # if proxy authentication is enabled and we have no puppet proxy set and the upload came from puppet,
          # use it as puppet proxy.
          if facts['_type'].blank? || facts['_type'] == 'puppet'
            host.puppet_proxy_id ||= proxy_id
          end

          host.save(:validate => false) if host.new_record?
          host
        end
      end
    end
  end
end
