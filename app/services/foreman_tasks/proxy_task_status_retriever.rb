module ForemanTasks
  class ProxyTaskStatusRetriever
    class << self
      def with_rails_cache_for(actions)
        actions = actions.map do |action|
          action.delegated_action.batch_proxy_output.merge(:action => action)
        end

        remotes = actions.select { |action| action[:source] == :remote }
        remotes.group_by { |batch| batch[:proxy_url] }
               .each do |url, group|
          polled = safe_status_check(ProxyAPI::ForemanDynflow::DynflowProxy.new(:url => url),
                                     group)
          polled.each { |id, response| ::Rails.cache.write("proxy-task-status-#{id}", response) }
        end

        yield
      ensure
        remotes.each { |action| ::Rails.cache.delete("proxy-task-status-#{action[:proxy_task_id]}") }
      end

      private

      def safe_status_check(proxy, group)
        ids = group.map { |batch| batch[:proxy_task_id] }
        proxy.statuses_of_tasks(ids)
      rescue
        {}
      end
    end
  end
end
