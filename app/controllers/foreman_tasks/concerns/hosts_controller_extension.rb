module ForemanTasks
  module Concerns
    module HostsControllerExtension
      extend ActiveSupport::Concern

      included do
        alias_method_chain :facts, :dynflow
      end

      def facts_with_dynflow
        task = ForemanTasks.async_task(::Actions::Foreman::Host::ImportFacts,
                                       detect_host_type,
                                       params[:name],
                                       params[:facts],
                                       params[:certname],
                                       detected_proxy.try(:id))

        render :json => {:task_id => task.id}, :status => 202
      rescue ::Foreman::Exception => e
        render :json => {'message'=>e.to_s}, :status => :unprocessable_entity
      end

    end
  end
end

