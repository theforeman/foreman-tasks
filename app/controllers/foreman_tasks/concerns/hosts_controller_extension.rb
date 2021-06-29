module ForemanTasks
  module Concerns
    module HostsControllerExtension
      extend ActiveSupport::Concern

      included do
        alias_method_chain :facts, :dynflow
      end

      def facts_with_dynflow
        type = params.fetch(:facts, {}).fetch(:_type, {}) || 'puppet'
        trigger_type = FactImporter.importer_for(type).support_background ? :async_task : :sync_task

        task = ForemanTasks.public_send(trigger_type,
                                        ::Actions::Foreman::Host::ImportFacts,
                                        detect_host_type,
                                        params[:name],
                                        params[:facts],
                                        params[:certname],
                                        detected_proxy.try(:id))

        render :json => { :task_id => task.id }, :status => :accepted
      rescue ::Foreman::Exception => e
        render :json => { 'message' => e.to_s }, :status => :unprocessable_entity
      end
    end
  end
end
