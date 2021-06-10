module ForemanTasks
  module FindTasksCommon
    def search_query
      [current_taxonomy_search, params[:search]].select(&:present?).join(' AND ')
    end

    def current_taxonomy_search
      conditions = []
      conditions << "organization_id = #{Organization.current.id}" if Organization.current
      conditions << "location_id = #{Location.current.id}" if Location.current
      conditions.empty? ? '' : "(#{conditions.join(' AND ')})"
    end
  end
end
