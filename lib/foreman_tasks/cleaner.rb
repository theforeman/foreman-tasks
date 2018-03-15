require 'csv'

module ForemanTasks
  # Represents the cleanup mechanism for tasks
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
        if cleanup_settings[:after]
          Foreman::Deprecation.deprecation_warning('1.18', _(':after setting in tasks cleanup section is deprecated, use :after in :rules section to set the value. to cleanup rules'))
          new(options.merge(:filter => '', :after => cleanup_settings[:after])).delete
        end
        with_periods = actions_with_default_cleanup
        with_periods.each do |action_class, period|
          new(options.merge(:filter => "label = #{action_class.name}", :after => period)).delete
        end
        actions_by_rules(with_periods).each do |hash|
          new(options.merge(hash)).delete
        end
      end
    end

    def self.actions_with_default_cleanup
      actions_with_periods = {}
      if cleanup_settings[:actions]
        cleanup_settings[:actions].each do |action|
          begin
            action_class = action[:name].constantize
            actions_with_periods[action_class] = action[:after]
          rescue => e
            Foreman::Logging.exception("Error handling #{action} cleanup settings", e)
          end
        end
      end
      (ForemanTasks.dynflow.world.action_classes - actions_with_periods.keys).each do |action_class|
        if action_class.respond_to?(:cleanup_after)
          actions_with_periods[action_class] = action_class.cleanup_after
        end
      end
      actions_with_periods
    end

    def self.cleanup_settings
      return @cleanup_settings if @cleanup_settings
      @cleanup_settings = SETTINGS[:'foreman-tasks'] && SETTINGS[:'foreman-tasks'][:cleanup] || {}
    end

    def self.actions_by_rules(actions_with_periods)
      disable_actions_with_periods = "label !^ (#{actions_with_periods.keys.join(', ')})"
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
      ForemanTasls::RemoteTask.where(:execution_plan_id => chunk.map(&:external_id)).delete_all
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
      db = ForemanTasks.dynflow.world.persistence.adapter.db
      uuid_select = Sequel.lit(ForemanTasks::Task.select(:external_id).to_sql)
      db[:dynflow_execution_plans].filter(:uuid => [uuid_select]).invert
    end

    def prepare_filter
      filter_parts = [filter]
      filter_parts << %(started_at < "#{after.ago.to_s(:db)}") if after > 0
      filter_parts << states.map { |s| "state = #{s}" }.join(' OR ') if states.any?
      filter_parts.select(&:present?).join(' AND ')
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
