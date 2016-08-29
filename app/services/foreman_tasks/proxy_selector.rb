module ForemanTasks
  class ProxySelector

    attr_reader :offline

    def initialize
      @tasks   = {}
      @offline = []
    end

    def strategies
      [:subnet, :fallback, :global]
    end

    def available_proxies(*args)
      raise NotImplementedError
    end

    def determine_proxy(*args)
      available_proxies = self.available_proxies(*args)
      return :not_defined if available_proxies.empty? || available_proxies.values.all?(&:empty?)
      proxy = nil

      strategies.each do |strategy|
        next unless available_proxies[strategy].present?
        proxy = select_by_jobs_count(available_proxies[strategy])
        break if proxy
      end

      proxy || :not_available
    end

    # Get the least loaded proxy from the given list of proxies
    def select_by_jobs_count(proxies)
      exclude = @tasks.keys + @offline
      @tasks.merge!(get_counts(proxies - exclude))
      next_proxy = @tasks.select { |proxy, _| proxies.include?(proxy) }.
          min_by { |_, job_count| job_count }.try(:first)
      @tasks[next_proxy] += 1 if next_proxy.present?
      next_proxy
    end

    private

    def get_counts(proxies)
      proxies.inject({}) do |result, proxy|
        begin
          proxy_api = ProxyAPI::ForemanDynflow::DynflowProxy.new(:url => proxy.url)
          result[proxy] = proxy_api.tasks_count('running')
        rescue => e
          @offline << proxy
          Foreman::Logging.exception "Could not fetch task counts from #{proxy}, skipped.", e
        end
        result
      end
    end
  end
end
