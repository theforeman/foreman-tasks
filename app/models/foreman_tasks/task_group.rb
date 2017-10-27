module ForemanTasks
  class TaskGroup < ActiveRecord::Base
    has_many :task_group_members, :dependent => :destroy
    has_many :tasks, :through => :task_group_members, :dependent => :nullify

    def resource_name
      raise NotImplementedError
    end

    def resource
      raise NotImplementedError
    end
  end
end
