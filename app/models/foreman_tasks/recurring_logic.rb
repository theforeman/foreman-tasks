module ForemanTasks
  require 'parse-cron'

  class RecurringLogic < ApplicationRecord
    include Authorizable

    graphql_type '::Types::RecurringLogic'

    belongs_to :task_group
    belongs_to :triggering

    has_many :tasks, :through => :task_group
    has_many :task_groups, -> { distinct }, :through => :tasks

    scoped_search :on => :id, :complete_value => false, :validator => ScopedSearch::Validators::INTEGER
    scoped_search :on => :max_iteration, :complete_value => false, :rename => :iteration_limit
    scoped_search :on => :iteration, :complete_value => false
    scoped_search :on => :cron_line, :complete_value => true
    scoped_search :on => :state, :complete_value => true
    scoped_search :on => :purpose, :complete_value => true

    validate :valid_purpose

    before_create do
      task_group.save
    end

    def self.allowed_states
      %w[active disabled finished cancelled failed]
    end

    def enabled=(value)
      task = tasks.find_by(:state => :scheduled)
      if task
        ForemanTasks.dynflow.world.persistence.set_delayed_plan_frozen(task.execution_plan.id, !value, next_occurrence_time)
        if value
          task.update!(:start_at => next_occurrence_time) if task.start_at < Time.zone.now
          update(:state => 'active')
        end
      elsif value
        raise RecurringLogicCancelledException
      end

      update(:state => 'disabled') unless value
    end

    def enabled?
      state != 'disabled'
    end

    def disabled?
      !enabled?
    end

    def start(action_class, *args)
      start_after(action_class, Time.zone.now, *args)
    end

    def start_after(action_class, time, *args)
      self.state = 'active'
      save!
      trigger_repeat_after(time, action_class, *args)
    end

    def trigger_repeat_after(time, action_class, *args)
      return if cancelled?
      if can_continue?(time)
        self.iteration += 1
        save!
        ::ForemanTasks.delay action_class,
                             generate_delay_options(time),
                             *args
      else
        self.state = 'finished'
        save!
        nil
      end
    end

    def trigger_repeat(action_class, *args)
      trigger_repeat_after(Time.zone.now, action_class, *args)
    end

    def cancel
      self.state = 'cancelled'
      save!
      tasks.active.each(&:cancel)
    end

    def next_occurrence_time(time = Time.zone.now)
      @parser ||= CronParser.new(cron_line, Time.zone)
      # @parser.next(start_time) is not inclusive of the start_time hence stepping back one run to include checking start_time for the first run.
      before_next = @parser.next(@parser.last(time))
      return before_next if before_next >= time && tasks.count == 0
      @parser.next(time)
    end

    def generate_delay_options(time = Time.zone.now, options = {})
      {
        :start_at => next_occurrence_time(time),
        :start_before => options['start_before'],
        :recurring_logic_id => id,
        :frozen => disabled?,
      }
    end

    def valid?(*_)
      cron_line.present? && valid_cronline? && !state.nil? || can_start?
    end

    def valid_cronline?
      !!next_occurrence_time
    rescue ArgumentError => _
      false
    end

    def can_start?(time = Time.zone.now)
      (end_time.nil? || next_occurrence_time(time) < end_time) &&
        (max_iteration.nil? || iteration < max_iteration)
    end

    def can_continue?(time = Time.zone.now)
      %w[active disabled].include?(state) && can_start?(time)
    end

    def finished?
      state == 'finished'
    end

    def cancelled?
      state == 'cancelled'
    end

    def done?
      %w[cancelled finished].include?(state)
    end

    def humanized_state
      case state
      when 'active'
        N_('Active')
      when 'cancelled'
        N_('Cancelled')
      when 'finished'
        N_('Finished')
      when 'disabled'
        N_('Disabled')
      else
        N_('N/A')
      end
    end

    def self.assemble_cronline(hash)
      hash.values_at(:minutes, :hours, :days, :months, :days_of_week)
          .map { |value| value.nil? || value.blank? ? '*' : value }
          .join(' ')
    end

    def self.new_from_cronline(cronline)
      new.tap do |logic|
        logic.cron_line = cronline
        logic.task_group = ::ForemanTasks::TaskGroups::RecurringLogicTaskGroup.new
      end
    end

    def self.new_from_triggering(triggering)
      cronline = if triggering.input_type == :cronline
                   triggering.cronline
                 else
                   ::ForemanTasks::RecurringLogic.assemble_cronline(cronline_hash(triggering.input_type, triggering.time, triggering.days, triggering.days_of_week))
                 end
      ::ForemanTasks::RecurringLogic.new_from_cronline(cronline).tap do |manager|
        manager.end_time = triggering.end_time if triggering.end_time_limited.present?
        manager.max_iteration = triggering.max_iteration if triggering.max_iteration.present?
        manager.purpose = triggering.purpose if triggering.purpose.present?
        manager.triggering = triggering
      end
    end

    def self.cronline_hash(recurring_type, time_hash, days, days_of_week_hash)
      hash = Hash[[:years, :months, :days, :hours, :minutes].zip(time_hash.values)]
      days_of_week = days_of_week_hash.select { |_key, value| value == '1' }.keys.join(',')
      hash.update :days_of_week => days_of_week, :days => days
      allowed_keys = case recurring_type
                     when :monthly
                       [:minutes, :hours, :days]
                     when :weekly
                       [:minutes, :hours, :days_of_week]
                     when :daily
                       [:minutes, :hours]
                     when :hourly
                       [:minutes]
                     end
      hash.select { |key, _| allowed_keys.include? key }
    end

    def valid_purpose?
      !(purpose.present? && self.class.where(:purpose => purpose, :state => %w[active disabled]).any?)
    end
  end
end
