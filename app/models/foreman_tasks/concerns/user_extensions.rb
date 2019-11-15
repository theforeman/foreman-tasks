module ForemanTasks
  module Concerns
    module UserExtensions
      extend ActiveSupport::Concern

      included do
        # rubocop:disable Rails/ReflectionClassName
        has_many :tasks, :dependent => :nullify,
                         :class_name => ::ForemanTasks::Task.name
        # rubocop:enable Rails/ReflectionClassName
      end
    end
  end
end
