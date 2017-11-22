module ForemanTasks
  # Monkey path until http://projects.theforeman.org/issues/8919 is
  # resolved and released
  module AuthorizerExt
    extend ActiveSupport::Concern

    def resource_name(klass)
      if klass.respond_to?(:authorized_resource_name)
        klass.authorized_resource_name
      else
        super klass
      end
    end
  end
end
