module ForemanTasks
  class TaskGroup < ActiveRecord::Base
    has_many :task_group_members
    has_many :tasks, :through => :task_group_members

    def resource_name
      raise NotImplementedError
    end

    def resource
      raise NotImplementedError
    end
  end
end
