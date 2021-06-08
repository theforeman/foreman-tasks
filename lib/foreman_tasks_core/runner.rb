require 'smart_proxy_dynflow/runner'

module ForemanTasksCore
  Runner = Proxy::Dynflow::Runner

  module Runner
    Action = Proxy::Dynflow::Action::Runner
  end
end
