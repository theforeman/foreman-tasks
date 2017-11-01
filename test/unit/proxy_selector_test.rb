require 'foreman_tasks_test_helper'

describe ForemanTasks::ProxySelector do
  let(:proxy_selector) { ForemanTasks::ProxySelector.new }

  before do
    ProxyAPI::ForemanDynflow::DynflowProxy.any_instance.stubs(:tasks_count).returns(0)
  end

  describe '#select_by_jobs_count' do
    it 'load balances' do
      count = 3
      ProxyAPI::ForemanDynflow::DynflowProxy.any_instance.expects(:tasks_count).raises
                                            .then.times(count - 1).returns(0)
      proxies = FactoryBot.create_list(:smart_proxy, count)

      available = proxies.reduce([]) do |found, _|
        found << proxy_selector.select_by_jobs_count(proxies)
      end

      available.count.must_equal count
      available.uniq.count.must_equal count - 1
      proxy_selector.offline.count.must_equal 1
    end

    it 'returns nil for if no proxy is available' do
      proxy_selector.select_by_jobs_count([]).must_be_nil
    end
  end

  describe '#determine_proxy' do
    it 'returns :not_defined when avialable proxies returns empty hash' do
      proxy_selector.stubs(:available_proxies => [])
      proxy_selector.determine_proxy.must_equal :not_defined
      proxy_selector.stubs(:available_proxies => { :global => [] })
      proxy_selector.determine_proxy.must_equal :not_defined
    end

    it 'returns :not_available when proxies are set but offline' do
      count = 3
      ProxyAPI::ForemanDynflow::DynflowProxy.any_instance.expects(:tasks_count).times(count).raises
      proxy_selector.stubs(:available_proxies =>
                           { :global => FactoryBot.create_list(:smart_proxy, count) })
      proxy_selector.determine_proxy.must_equal :not_available
    end

    it 'returns first available proxy, prioritizing by strategy' do
      ProxyAPI::ForemanDynflow::DynflowProxy.any_instance.expects(:tasks_count).returns(0)
      fallback_proxy = FactoryBot.build(:smart_proxy)
      global_proxy = FactoryBot.build(:smart_proxy)
      ForemanTasks::ProxySelector.any_instance.stubs(:available_proxies =>
                                                     { :fallback => [fallback_proxy],
                                                       :global => [global_proxy] })
      ForemanTasks::ProxySelector.new.determine_proxy.must_equal fallback_proxy
      ProxyAPI::ForemanDynflow::DynflowProxy.any_instance.expects(:tasks_count).raises.then.returns(0)
      ForemanTasks::ProxySelector.new.determine_proxy.must_equal global_proxy
    end
  end
end
