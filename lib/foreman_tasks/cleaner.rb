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
          new(options.merge(:filter => '', :after => cleanup_settings[:after])).delete
        end
        actions_with_default_cleanup.each do |action_class, period|
          new(options.merge(:filter => "label = #{action_class.name}", :after => period)).delete
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
                          :states       => ['stopped'] }
      options         = default_options.merge(options)

      @filter         = options[:filter]
      @after          = parse_time_interval(options[:after])
      @states         = options[:states]
      @verbose        = options[:verbose]
      @batch_size     = options[:batch_size]
      @noop           = options[:noop]

      raise ArgumentError, 'filter not speficied' if @filter.nil?

      @full_filter = prepare_filter
    end

    # Delete the filtered tasks, including the dynflow execution plans
    def delete
      if noop
        say "[noop] deleting all tasks matching filter #{full_filter}"
        say "[noop] #{ForemanTasks::Task.search_for(full_filter).size} tasks would be deleted"
      else
        start_tracking_progress
        while (chunk = ForemanTasks::Task.search_for(full_filter).limit(batch_size)).any?
          delete_tasks(chunk)
          delete_dynflow_plans(chunk)
          report_progress(chunk)
        end
      end
    end

    def tasks
      ForemanTasks::Task.search_for(full_filter).select('DISTINCT foreman_tasks_tasks.id, foreman_tasks_tasks.type, foreman_tasks_tasks.external_id')
    end

    def delete_tasks(chunk)
      ForemanTasks::Task.where(:id => chunk.map(&:id)).delete_all
    end

    def delete_dynflow_plans(chunk)
      dynflow_ids = chunk.find_all { |task| task.is_a? Task::DynflowTask }.map(&:external_id)
      ForemanTasks.dynflow.world.persistence.delete_execution_plans({ 'uuid' => dynflow_ids }, batch_size)
    end

    def prepare_filter
      filter_parts = [filter]
      filter_parts << %(started_at < "#{after.ago.to_s(:db)}") if after > 0
      filter_parts << states.map { |s| "state = #{s}" }.join(' OR ') if states.any?
      filter_parts.select(&:present?).join(' AND ')
    end

    def start_tracking_progress
      if verbose
        @current = 0
        @total = tasks.size
        say "#{@current}/#{@total}", false
      end
    end

    def report_progress(chunk)
      if verbose
        @current += chunk.size
        say "#{@current}/#{@total}", false
      end
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
