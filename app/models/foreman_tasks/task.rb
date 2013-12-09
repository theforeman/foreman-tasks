require 'uuidtools'

module ForemanTasks
  class Task < ActiveRecord::Base

    self.primary_key = :uuid

    before_create :generate_uuid

    def generate_uuid
      self.uuid ||= UUIDTools::UUID.random_create.to_s
    end

  end
end
