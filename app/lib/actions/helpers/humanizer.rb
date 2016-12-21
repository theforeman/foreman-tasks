module Actions
  module Helpers
    class Humanizer
      def initialize(action)
        @action = action
        @input  = action.respond_to?(:task_input) ? action.task_input : action.input
        @input ||= {}
        @output = action.respond_to?(:task_output) ? action.task_output : action.output
        @output ||= {}
      end

      def self.resource_classes_order
        @resource_classes_order ||= []
      end

      def self.resource(name)
        resource_classes_order.map(&:new).find { |resource| resource.name == name }
      end

      def self.default_parts
        resource_classes_order.map { |klass| klass.new.name }
      end

      # Registers the resource class to the humanizer. Usually, this
      # happens when the resource class is defined. The order of resources
      # in the humanized input is determined by the registration order.
      # The `register_resource` can be run more times for the same class,
      # effectively moving the resource to the end of the humanized form.
      def self.register_resource(resource_class)
        resource_classes_order.delete_if { |klass| klass.name == resource_class.name }
        resource_classes_order << resource_class
      end

      def input(*parts)
        parts = self.class.default_parts if parts.empty?
        included_parts(parts, @input).map do |part|
          [part, humanize_resource(part, @input)]
        end
      end

      def included_parts(parts, data)
        parts.select { |part| data.key?(part) }
      end

      def humanize_resource(name, data)
        if (resource = self.class.resource(name))
          { text: "#{resource.humanized_name} '#{resource.humanized_value(data)}'",
            link: resource.link(data) }
        end
      end

      class Resource
        def name
          raise NotImplementedError
        end

        def humanized_name
          name
        end

        def link(data); end

        def humanized_value(data)
          fetch_data(data, name, :name) ||
            fetch_data(data, name, :label) ||
            fetch_data(data, name, :id)
        end

        def self.inherited(klass)
          Humanizer.register_resource(klass)
        end

        private

        def fetch_data(data, *subkeys)
          if subkeys.empty?
            data
          else
            head, *tail = subkeys
            if data.is_a?(Hash) && data.key?(head)
              return fetch_data(data[head], *tail)
            else
              return nil
            end
          end
        end
      end

      class ActivationKeyResource < Resource
        def name
          :activation_key
        end

        def humanized_name
          _('activation key')
        end

        def link(data)
          if (ackey_id = fetch_data(data, :activation_key, :id))
            "/activation_keys/#{ackey_id}/info"
          end
        end
      end

      class UserResource < Resource
        def name
          :user
        end

        def humanized_name
          _('user')
        end
      end

      # TODO: remove after getting the definitions into Katello
      class RepositoryResource < Resource
        def name
          :repository
        end

        def humanized_name
          _('repository')
        end

        def link(data)
          product_id = fetch_data(data, :product, :id)
          repo_id = fetch_data(data, :repo, :id)
          if product_id && repo_id
            "#/products/#{product_id}/repositories/#{repo_id}"
          end
        end
      end

      class ContentViewVersionResource < Resource
        def name
          :content_view_version
        end

        def humanized_name
          _('content view version')
        end
      end

      class ContentViewResource < Resource
        def name
          :content_view
        end

        def humanized_name
          _('content view')
        end

        def link(data)
          if (content_view_id = fetch_data(data, :content_view, :id))
            "#/content_views/#{content_view_id}/versions"
          end
        end
      end

      class ProductResource < Resource
        def name
          :product
        end

        def humanized_name
          _('product')
        end

        def link(data)
          if (product_id = fetch_data(data, :product, :id))
            "#/products/#{product_id}/info"
          end
        end
      end

      class SystemResource < Resource
        def name
          :system
        end

        def humanized_name
          _('system')
        end

        def link(data)
          if (system_uuid = fetch_data(data, :system, :uuid))
            "#/systems/#{system_uuid}/info"
          end
        end
      end

      class OrganizationResource < Resource
        def name
          :organization
        end

        def humanized_name
          _('organization')
        end

        def link(data)
          if (org_id = fetch_data(data, :organization, :id))
            "/organizations/#{org_id}/edit"
          end
        end
      end
    end
  end
end
