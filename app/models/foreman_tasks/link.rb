module ForemanTasks
  class Link < ApplicationRecord
    belongs_to :task

    belongs_to :resource, polymorphic: true

    scope :for_resource, ->(resource) { where(:resource => resource) }

    validates :task_id, :resource_id, :resource_type, presence: true

    class << self
      # Assigns the resource to the task to easily track the task in context of
      # the resource. This doesn't prevent other actions to lock the resource
      # and should be used only for actions that tolerate other actions to be
      # performed on the resource. Usually, this shouldn't needed to be done
      # through the action directly, because the lock should assign it's parrent
      # objects to the action srecursively (using +related_resources+ method in model
      # objects)
      def link!(resource, uuid)
        build_link(resource, uuid).save!
      end

      # Records the information about the user that triggered the task
      def owner!(user, uuid)
        link!(user, uuid)
      end

      def build_related_links(resource, uuid = nil)
        related_resources(resource).map do |related_resource|
          build_link(related_resource, uuid)
        end
      end

      private

      def build_link(resource, uuid = nil)
        build(uuid, resource, false)
      end

      def build(uuid, resource, exclusive)
        find_or_create_by(task_id:       uuid,
                          resource_type: resource.class.name,
                          resource_id:   resource.id)
      end

      # recursively search for related resources of the resource (using
      # the +related_resources+ method, avoiding the cycles
      def related_resources(resource)
        if resource.respond_to?(:all_related_resources)
          resource.all_related_resources
        else
          []
        end
      end
    end
  end
end
