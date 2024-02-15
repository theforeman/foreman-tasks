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

      assert_equal count, available.count
      assert_equal count - 1, available.uniq.count
      assert_equal 1, proxy_selector.offline.count
    end

    it 'returns nil for if no proxy is available' do
      assert_nil proxy_selector.select_by_jobs_count([])
    end
  end

  describe '#determine_proxy' do
    it 'returns :not_defined when avialable proxies returns empty hash' do
      proxy_selector.stubs(:available_proxies => [])
      assert_equal :not_defined, proxy_selector.determine_proxy
      proxy_selector.stubs(:available_proxies => { :global => [] })
      assert_equal :not_defined, proxy_selector.determine_proxy
    end

    it 'returns :not_available when proxies are set but offline' do
      count = 3
      ProxyAPI::ForemanDynflow::DynflowProxy.any_instance.expects(:tasks_count).times(count).raises
      proxy_selector.stubs(:available_proxies =>
                           { :global => FactoryBot.create_list(:smart_proxy, count) })
      assert_equal :not_available, proxy_selector.determine_proxy
    end

    it 'returns first available proxy, prioritizing by strategy' do
      ProxyAPI::ForemanDynflow::DynflowProxy.any_instance.expects(:tasks_count).returns(0)
      fallback_proxy = FactoryBot.build(:smart_proxy)
      global_proxy = FactoryBot.build(:smart_proxy)
      ForemanTasks::ProxySelector.any_instance.stubs(:available_proxies =>
                                                     { :fallback => [fallback_proxy],
                                                       :global => [global_proxy] })
      assert_equal fallback_proxy, ForemanTasks::ProxySelector.new.determine_proxy
      ProxyAPI::ForemanDynflow::DynflowProxy.any_instance.expects(:tasks_count).raises.then.returns(0)
      assert_equal global_proxy, ForemanTasks::ProxySelector.new.determine_proxy
    end
  end
end
