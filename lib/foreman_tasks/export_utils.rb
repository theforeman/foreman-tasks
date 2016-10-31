module ForemanTasks
  class ExportUtils < ::Dynflow::Utilities::Export
    def filter
      filter = ''
      
      if @task_search.nil? && @task_days.nil?
        filter = "started_at > \"#{7.days.ago.to_s(:db)}\" || " \
                 "(result != success && started_at > \"#{60.days.ago.to_s(:db)})\""
      else
        filter = @task_search || ''
      end

      if (days = @task_days)
        filter += " && " unless filter == ''
        filter += "started_at > \"#{days.to_i.days.ago.to_s(:db)}\""
      end

      filter
    end

    def plans
      return @plans if @plans
      ids = ForemanTasks::Task.search_for(filter).pluck(&:external_id)
      @plans ||= world.persistence.find_execution_plans(:id => ids)
    end

    def world
      ForemanTasks.dynflow.world
    end
  end
end

