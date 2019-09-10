module ForemanTasks
  class Task
    module Search
      def search_by_generic_resource(key, operator, value)
        key = 'resource_type' if key.blank?
        key_name = connection.quote_column_name(key.sub(/^.*\./, ''))
        condition = sanitize_sql_for_conditions(["foreman_tasks_locks.#{key_name} #{operator} ?", value])

        { :conditions => condition, :joins => :locks }
      end

      def search_by_taxonomy(key, operator, value)
        uniq_suffix = SecureRandom.hex(3)
        resource_type = key == 'location_id' ? 'Location' : 'Organization'

        joins = <<-SQL
        LEFT JOIN foreman_tasks_locks AS foreman_tasks_locks_taxonomy#{uniq_suffix}
        ON (foreman_tasks_locks_taxonomy#{uniq_suffix}.task_id = foreman_tasks_tasks.id AND
            foreman_tasks_locks_taxonomy#{uniq_suffix}.resource_type = '#{resource_type}')
        SQL
        # Select only those tasks which either have the correct taxonomy or are not related to any
        sql = "foreman_tasks_locks_taxonomy#{uniq_suffix}.resource_id #{operator} ? OR foreman_tasks_locks_taxonomy#{uniq_suffix}.resource_id IS NULL"
        { :conditions => sanitize_sql_for_conditions([sql, value]), :joins => joins }
      end
    end
  end
end
