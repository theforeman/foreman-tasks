module ForemanTasks
  class Triggering < ApplicationRecord
    PARAMS = [:start_at_raw, :start_before_raw, :max_iteration, :input_type,
              :cronline, :days, :days_of_week, :time, :end_time_limited,
              :end_time, :purpose].freeze
    attr_accessor(*PARAMS)

    graphql_type '::Types::Triggering'

    before_save do
      unless immediate?
        parse_start_at!
        parse_start_before!
      end
    end

    ALLOWED_MODES = [:immediate, :future, :recurring].freeze
    ALLOWED_INPUT_TYPES = [:cronline, :monthly, :weekly, :daily, :hourly].freeze

    TIME_FORMAT = '%Y-%m-%d %H:%M'.freeze
    TIME_REGEXP = /\A\d{4}-\d{2}-\d{2} \d{2}:\d{2}\Z/.freeze
    DAYS_REGEXP = /\A(\s*\d{1,2}\s*)(,\s*\d{1,2}\s*)*\Z/.freeze

    has_one :recurring_logic, :foreign_key => :triggering_id, :dependent => :nullify

    validates :mode, :inclusion => { :in => ALLOWED_MODES,
                                     :message => _('%{value} is not allowed triggering mode') }
    validates :input_type, :if => :recurring?,
                           :inclusion => { :in => ALLOWED_INPUT_TYPES,
                                           :message => _('%{value} is not allowed input type') }
    validates :start_at_raw, format: { :with => TIME_REGEXP, :if => ->(triggering) { triggering.future? || (triggering.recurring? && triggering.start_at_raw) },
                                       :message => _('%{value} is wrong format'), :allow_blank => true }
    validates :start_before_raw, format: { :with => TIME_REGEXP, :if => :future?,
                                           :message => _('%{value} is wrong format'), :allow_blank => true }
    validates :days, format: { :with => DAYS_REGEXP,
                               :if => proc { |t| t.recurring? && t.input_type == :monthly } }
    validate :can_start_recurring, :if => :recurring?
    validate :can_start_future, :if => :future?
    validate :start_at_is_not_past, :if => ->(triggering) { triggering.start_at_relevant? && triggering.start_at_changed? }

    def self.new_from_params(params = {})
      new(params.except(:mode, :start_at, :start_before)).tap do |triggering|
        triggering.mode = params.fetch(:mode, :immediate).to_sym
        triggering.input_type = params.fetch(:input_type, :daily).to_sym
        triggering.end_time_limited = params[:end_time_limited] == 'true'
        triggering.recurring_logic = ::ForemanTasks::RecurringLogic.new_from_triggering(triggering) if triggering.recurring?
      end
    end

    def mode
      super.to_sym
    end

    def mode=(mod)
      if (mod.is_a?(String) || mod.is_a?(Symbol)) && ALLOWED_MODES.map(&:to_s).include?(mod.downcase.to_s)
        super(mod.downcase.to_sym)
      else
        raise ArgumentError, _('mode has to be one of %{allowed_modes}') % { :allowed_modes => ALLOWED_MODES.join(', ') }
      end
    end

    def trigger(action, *args)
      case mode
      when :immediate
        ::ForemanTasks.async_task action, *args
      when :future
        ::ForemanTasks.delay action,
                             delay_options,
                             *args
      when :recurring
        recurring_logic.start_after(action, delay_options[:start_at] || Time.zone.now, *args)
      end
    end

    def delay_options
      {
        :start_at => start_at.try(:utc),
        :start_before => start_before.try(:utc),
      }
    end

    def future?
      mode == :future
    end

    def immediate?
      mode == :immediate
    end

    def recurring?
      mode == :recurring
    end

    def parse_start_at!
      self.start_at ||= Time.zone.parse(start_at_raw) if start_at_raw.present?
    end

    def parse_start_at
      self.start_at ||= Time.zone.parse(start_at_raw) if start_at_raw.present?
    rescue ArgumentError
      errors.add(:start_at, _('is not a valid format'))
    end

    def parse_start_before!
      self.start_before ||= Time.zone.parse(start_before_raw) if start_before_raw.present?
    end

    # start_at is required for future execution and optional for recurring execution
    def start_at_relevant?
      future? || (recurring? && (start_at || start_at_raw))
    end

    private

    def can_start_recurring
      parse_start_at
      errors.add(:input_type, _('No task could be started')) unless recurring_logic.valid?
      errors.add(:purpose, _('Active or disabled recurring logic with purpose %s already exists') % recurring_logic.purpose) unless recurring_logic.valid_purpose?
      errors.add(:cronline, _('%s is not valid format of cron line') % cronline) unless recurring_logic.valid_cronline?
    end

    def can_start_future
      parse_start_before!
      parse_start_at!
      errors.add(:start_before_raw, _('The task could not be started')) if !start_before.nil? && start_before < start_at
    end

    def start_at_is_not_past
      errors.add(:start_at, _('is in the past')) if !start_at.nil? && start_at < Time.zone.now
    end
  end
end
