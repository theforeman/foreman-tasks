module ForemanTasks
  class TaskGroupMember < ActiveRecord::Base
    belongs_to :task_group
    belongs_to :task
  end
end
