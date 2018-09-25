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

      def search_by_owner(key, operator, value)
        return { :conditions => '0 = 1' } if value == 'current_user' && User.current.nil?

        key = 'owners.login' if key == 'user'
        # using uniq suffix to avoid colisions when searching by two different owners via ScopedSearch
        uniq_suffix = SecureRandom.hex(3)
        key_name = connection.quote_column_name(key.sub(/^.*\./, ''))
        value.sub!('*', '%%')
        condition = if key.blank?
                      sanitize_sql_for_conditions(["users_#{uniq_suffix}.login #{operator} ? or users_#{uniq_suffix}.firstname #{operator} ? ", value, value])
                    elsif key =~ /\.id\Z/
                      value = User.current.id if value == 'current_user'
                      sanitize_sql_for_conditions(["foreman_tasks_tasks.user_id #{operator} ?", value])
                    else
                      placeholder, value = operator == 'IN' ? ['(?)', value.split(',').map(&:strip)] : ['?', value]
                      sanitize_sql_for_conditions(["users_#{uniq_suffix}.#{key_name} #{operator} #{placeholder}", value])
                    end
        { :conditions => condition, :joins => joins_for_user_search(key, uniq_suffix) }
      end

      def joins_for_user_search(key, uniq_suffix)
        return '' if key =~ /\.id\Z/
        "INNER JOIN users AS users_#{uniq_suffix} ON users_#{uniq_suffix}.id = foreman_tasks_tasks.user_id"
      end
    end
  end
end
