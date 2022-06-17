require 'csv'

module ForemanTasks
  # Represents the cleanup mechanism for tasks
  class ActionRule
    attr_reader :klass, :after, :condition
    def initialize(klass, after, condition = nil)
      @klass = klass
      @after = after
      @condition = condition
    end

    def exclude_search
      "NOT (#{include_search})"
    end

    def include_search
      parts = if klass.is_a? Array
                ["label ^ (#{klass.join(', ')})"]
              else
                ["label = \"#{klass}\""]
              end
      parts << "(#{@condition})" if @condition
      '(' + parts.join(' AND ') + ')'
    end

    def self.compose_include_rules(rules)
      rules.group_by { |rule| [rule.after, rule.condition] }
           .map do |(after, condition), rules|
        ActionRule.new(rules.map(&:klass), after, condition)
      end
    end
  end

  class CompositeActionRule
    def initialize(*rules)
      @rules = rules
    end

    def exclude_search
      partial_condition = @rules.group_by(&:condition)
                                .map do |condition, rules|
        ActionRule.new(rules.map(&:klass), nil, condition).include_search
      end.join(' OR ')
      "NOT (#{partial_condition})"
    end
  end

  class Cleaner
    def self.run(options)
      if options.key?(:filter)
        new(options).delete
      else
        [:after, :states].each do |invalid_option|
          if options.key?(invalid_option)
            raise "The option #{invalid_option} is not valid unless the filter specified"
          end
        end
        with_periods = actions_with_default_cleanup
        ActionRule.compose_include_rules(with_periods).each do |rule|
          new(options.merge(:filter => rule.include_search, :after => rule.after)).delete
        end
        actions_by_rules(CompositeActionRule.new(*with_periods)).each do |hash|
          new(options.merge(hash)).delete
        end
      end
    end

    def self.actions_with_default_cleanup
      actions = cleanup_settings.fetch(:actions, [])
                                .flat_map do |action|
        Array(action[:name]).map do |klass|
          ActionRule.new(klass.safe_constantize || klass, action[:after], action[:filter])
        end
                rescue => e
                  Foreman::Logging.exception("Error handling #{action} cleanup settings", e)
                  nil
      end.compact
      hardcoded = (ForemanTasks.dynflow.world.action_classes - actions.map(&:klass))
                  .select { |klass| klass.respond_to?(:cleanup_after) || klass.respond_to?(:cleanup_rules) }
                  .flat_map { |klass| klass.respond_to?(:cleanup_rules) ? klass.cleanup_rules : ActionRule.new(klass, klass.cleanup_after) }
      actions + hardcoded
    end

    def self.cleanup_settings
      return @cleanup_settings if @cleanup_settings
      @cleanup_settings = SETTINGS[:'foreman-tasks'] && SETTINGS[:'foreman-tasks'][:cleanup] || {}
    end

    def self.actions_by_rules(action_rules)
      disable_actions_with_periods = action_rules.exclude_search
      cleanup_settings.fetch(:rules, []).map do |hash|
        next if hash[:after].nil?
        conditions = []
        conditions << disable_actions_with_periods unless hash[:override_actions]
        conditions << hash[:filter] if hash[:filter]
        hash[:states] = [] if hash[:states] == 'all'
        hash[:filter] = conditions.map { |condition| "(#{condition})" }.join(' AND ')
        hash
      end.compact
    end

    attr_reader :filter, :after, :states, :verbose, :batch_size, :noop, :full_filter

    # @param filter [String] scoped search matching the tasks to be deleted
    # @param after [String|nil] delete the tasks after they are older
    #                           than the value: the number in string is expected
    #                           to be followed by time unit specification one of s,h,d,y for
    #        seconds ago. If not specified, no implicit filtering on the date.
    def initialize(options = {})
      default_options = { :after        => '0s',
                          :verbose      => false,
                          :batch_size   => 1000,
                          :noop         => false,
                          :states       => ['stopped'],
                          :backup_dir   => ForemanTasks.dynflow.world.persistence.current_backup_dir }
      options         = default_options.merge(options)
      Foreman::Logging.logger('foreman-tasks').info("Running foreman-tasks cleaner with options #{options.inspect}")

      @filter         = options[:filter]
      @after          = parse_time_interval(options[:after])
      @states         = options[:states]
      @verbose        = options[:verbose]
      @batch_size     = options[:batch_size]
      @noop           = options[:noop]
      @backup_dir     = options[:backup_dir]

      raise ArgumentError, 'filter not speficied' if @filter.nil?

      @full_filter = prepare_filter
    end

    # Delete the filtered tasks, including the dynflow execution plans
    def delete
      message = "deleting all tasks matching filter #{full_filter}"
      with_noop(ForemanTasks::Task.search_for(full_filter), 'tasks matching filter', message) do |source, name|
        with_batches(source, name) do |chunk|
          delete_tasks chunk
          delete_dynflow_plans chunk
          delete_remote_tasks(chunk)
        end
      end
      delete_orphaned_locks
      delete_orphaned_links
      delete_orphaned_dynflow_tasks
    end

    def tasks
      ForemanTasks::Task.search_for(full_filter).select('DISTINCT foreman_tasks_tasks.id, foreman_tasks_tasks.type, foreman_tasks_tasks.external_id')
    end

    def delete_tasks(chunk)
      tasks = ForemanTasks::Task.where(:id => chunk.map(&:id))
      tasks_to_csv(tasks, @backup_dir, 'foreman_tasks.csv') if @backup_dir
      tasks.delete_all
    end

    def delete_remote_tasks(chunk)
      ForemanTasks::RemoteTask.where(:execution_plan_id => chunk.map(&:external_id)).delete_all
    end

    def tasks_to_csv(dataset, backup_dir, file_name)
      with_backup_file(backup_dir, file_name) do |csv, appending|
        csv << ForemanTasks::Task.attribute_names.to_csv unless appending
        dataset.each do |row|
          csv << row.attributes.values.to_csv
        end
      end
      dataset
    end

    def with_backup_file(backup_dir, file_name)
      FileUtils.mkdir_p(backup_dir) unless File.directory?(backup_dir)
      csv_file = File.join(backup_dir, file_name)
      appending = File.exist?(csv_file)
      File.open(csv_file, 'a') do |f|
        yield f, appending
      end
    end

    def delete_dynflow_plans(chunk)
      delete_dynflow_plans_by_uuid chunk.find_all { |task| task.is_a? Task::DynflowTask }.map(&:external_id)
    end

    def delete_dynflow_plans_by_uuid(uuids)
      ForemanTasks.dynflow.world.persistence.delete_execution_plans({ 'uuid' => uuids }, batch_size, @backup_dir)
    end

    def delete_orphaned_locks
      orphaned_locks = ForemanTasks::Lock.left_outer_joins(:task).where(:'foreman_tasks_tasks.id' => nil)
      with_noop(orphaned_locks, 'orphaned task locks') do |source, name|
        with_batches(source, name) do |chunk|
          ForemanTasks::Lock.where(id: chunk.pluck(:id)).delete_all
        end
      end
    end

    def delete_orphaned_links
      orphaned_links = ForemanTasks::Link.left_outer_joins(:task).where(:'foreman_tasks_tasks.id' => nil)
      with_noop(orphaned_links, 'orphaned task links') do |source, name|
        with_batches(source, name) do |chunk|
          ForemanTasks::Link.where(id: chunk.pluck(:id)).delete_all
        end
      end
    end

    def delete_orphaned_dynflow_tasks
      with_noop(orphaned_dynflow_tasks, 'orphaned execution plans') do |source, name|
        with_batches(source, name) do |chunk|
          delete_dynflow_plans_by_uuid chunk.select_map(:uuid)
        end
      end
    end

    # source must respond to :count and :limit
    def with_noop(source, name, noop_message = nil)
      if noop
        say '[noop] ' + noop_message if noop_message
        say "[noop] #{source.count} #{name} would be deleted"
      else
        yield source, name
      end
    end

    def with_batches(source, name)
      count = source.count
      if count.zero?
        say("No #{name} found, skipping.")
        return
      end
      start_tracking_progress(name, count)
      while (chunk = source.limit(batch_size)).any?
        chunk_size = chunk.count
        yield chunk
        report_progress(chunk_size)
      end
      report_done(name)
    end

    def orphaned_dynflow_tasks
      dynflow_plan_uuid_attribute = "dynflow_execution_plans.uuid"
      if ActiveRecord::Base.connection.adapter_name == 'PostgreSQL'
        # typecast the UUID attribute for Postgres
        dynflow_plan_uuid_attribute += "::varchar"
      end

      db = ForemanTasks.dynflow.world.persistence.adapter.db
      db.fetch("select dynflow_execution_plans.uuid from dynflow_execution_plans left join "\
               "foreman_tasks_tasks on (#{dynflow_plan_uuid_attribute} = foreman_tasks_tasks.external_id) "\
               "where foreman_tasks_tasks.id IS NULL")
    end

    def prepare_filter
      filter_parts = [filter]
      filter_parts << %(started_at < "#{after.ago.to_s(:db)}") if after > 0
      filter_parts << "state ^ (#{states.join(',')})" if states.any?
      filter_parts.select(&:present?).map { |segment| "(#{segment})" }.join(' AND ')
    end

    def start_tracking_progress(name, total = tasks.size)
      say "About to remove #{total} #{name}"
      @current = 0
      @total = total
      say "#{@current}/#{@total}", false if verbose
    end

    def report_progress(count)
      @current += count
      say "#{@current}/#{@total}", false if verbose
    end

    def report_done(name)
      say "Deleted #{@current} #{name}"
    end

    def say(message, log = true)
      puts message
      Foreman::Logging.logger('foreman-tasks').info(message) if log
    end

    def parse_time_interval(string)
      matched_string = string.delete(' ').match(/\A(\d+)(\w)\Z/)
      unless matched_string
        raise ArgumentError, "String #{string} isn't an expected specification of time in format of \"{number}{time_unit}\""
      end
      number = matched_string[1].to_i
      value = case matched_string[2]
              when 's'
                number.seconds
              when 'h'
                number.hours
              when 'd'
                number.days
              when 'y'
                number.years
              else
                raise ArgumentError, "Unexpected time unit in #{string}, expected one of [s,h,d,y]"
              end
      value
    end
  end
end
