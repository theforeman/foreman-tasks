module ForemanTasks
  class RemoteTask < ActiveRecord::Base

    belongs_to :task, :class_name => 'ForemanTasks::Task',
      :primary_key => :external_id,
      :foreign_key => :execution_plan_id

    enum :status => [:new, :running]
  end
end
