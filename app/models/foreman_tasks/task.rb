require 'uuidtools'

module ForemanTasks
  class Task < ActiveRecord::Base

    self.primary_key = :uuid

    before_create :generate_uuid

    has_many :locks, foreign_key: :task_uuid

    scope :active, -> {  where('state != ?', :stopped) }

    def input
      {}
    end

    def output
      {}
    end

    def username
      # TODO: search in user locks
      nil
    end

    def humanized
      { action: label,
        input:  "",
        output: "" }
    end

    def cli_example
      ""
    end

    # returns true if the task is running or waiting to be run
    def pending
      self.state != 'stopped'
    end

    protected

    def generate_uuid
      self.uuid ||= UUIDTools::UUID.random_create.to_s
    end

  end
end
