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
      # through the action directly, because the lock should assign it's parent
      # objects to the action recursively (using +related_resources+ method in model
      # objects)
      def link!(resource, task)
        link = build(resource, task)
        link.save!
        link
      end

      # Records the information about the user that triggered the task
      def owner!(user, task)
        link!(user, task)
      end

      def link_resource_and_related!(resource, task)
        link!(resource, task)
        build_related_links(resource, task).each(&:save!)
      end

      def build_related_links(resource, task)
        related_resources(resource).map do |related_resource|
          build(related_resource, task)
        end
      end

      private

      def build(resource, task)
        find_or_initialize_by(task_id:       task.id,
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
