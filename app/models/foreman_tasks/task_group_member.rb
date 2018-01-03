module ForemanTasks
  class TaskGroupMember < ApplicationRecord
    belongs_to :task_group
    belongs_to :task
  end
end
