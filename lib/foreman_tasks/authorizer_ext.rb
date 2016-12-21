module ForemanTasks
  # Monkey path until http://projects.theforeman.org/issues/8919 is
  # resolved and released
  module AuthorizerExt
    extend ActiveSupport::Concern

    included do
      alias_method_chain :resource_name, :authorized_resource_name
    end

    def resource_name_with_authorized_resource_name(klass)
      if klass.respond_to?(:authorized_resource_name)
        klass.authorized_resource_name
      else
        resource_name_without_authorized_resource_name(klass)
      end
    end
  end
end
