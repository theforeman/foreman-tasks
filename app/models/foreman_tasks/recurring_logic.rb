module ForemanTasks

  require 'parse-cron'

  class RecurringLogic < ActiveRecord::Base
    include Authorizable

    belongs_to :task_group
    belongs_to :triggering

    has_many :tasks, :through => :task_group
    has_many :task_groups, -> { uniq }, :through => :tasks

    validates :cron_line, :presence => true

    scoped_search :on => :id, :complete_value => false
    scoped_search :on => :max_iteration, :complete_value => false, :rename => :iteration_limit
    scoped_search :on => :iteration, :complete_value => false
    scoped_search :on => :cron_line, :complete_value => true

    before_create do
      self.task_group.save
    end

    def self.allowed_states
      %w(active finished cancelled failed)
    end

    def start(action_class, *args)
      self.state = 'active'
      save!
      trigger_repeat(action_class, *args)
    end

    def trigger_repeat(action_class, *args)
      unless can_continue?
        self.state = 'finished'
        save!
        return
      else
        self.iteration += 1
        save!
        ::ForemanTasks.delay action_class,
                             generate_delay_options,
                             *args
      end
    end

    def cancel
      self.state = 'cancelled'
      save!
      tasks.active.each(&:cancel)
    end

    def next_occurrence_time(time = Time.now)
      @parser ||= CronParser.new(cron_line)
      @parser.next(time)
    end

    def generate_delay_options(time = Time.now, options = {})
      {
        :start_at => next_occurrence_time(time),
        :start_before => options['start_before'],
        :recurring_logic_id => self.id
      }
    end

    def can_continue?(time = Time.now)
      self.state == 'active' &&
        (end_time.nil? || next_occurrence_time(time) < end_time) &&
        (max_iteration.nil? || iteration < max_iteration)
    end

    def finished?
      self.state == 'finished'
    end

    def humanized_state
      case self.state
      when 'active'
        N_('Active')
      when 'cancelled'
        N_('Cancelled')
      when 'finished'
        N_('Finished')
      else
        N_('N/A')
      end
    end

    def self.assemble_cronline(hash)
      hash.values_at(*[:minutes, :hours, :days, :months, :days_of_week])
          .map { |value| (value.nil? || value.blank?) ? '*' : value }
          .join(' ')
    end

    def self.new_from_cronline(cronline)
      self.new.tap do |logic|
        logic.cron_line = cronline
        logic.task_group = ::ForemanTasks::TaskGroups::RecurringLogicTaskGroup.new
      end
    end

    def self.new_from_triggering(triggering)
      cronline = if triggering.input_type == :cronline
                   triggering.cronline
                 else
                   ::ForemanTasks::RecurringLogic.assemble_cronline(cronline_hash triggering.input_type, triggering.time, triggering.days_of_week)
                 end
      ::ForemanTasks::RecurringLogic.new_from_cronline(cronline).tap do |manager|
        manager.end_time = Time.new(*recurring_options.end_time.values) if triggering.end_time_limited
        manager.max_iteration = triggering.max_iteration unless triggering.max_iteration.blank?
        manager.triggering = triggering
      end
    end

    def self.cronline_hash(recurring_type, time_hash, days_of_week_hash)
      hash = Hash[[:years, :months, :days, :hours, :minutes].zip(time_hash.values)]
      
      hash.update :days_of_week => days_of_week_hash
                                  .select { |value, index| value == "1" }
                                  .values.join(',')
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
  end
end
