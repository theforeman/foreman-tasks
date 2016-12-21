module ForemanTasks
  class Triggering < ActiveRecord::Base
    PARAMS = [:start_at_raw, :start_before_raw, :max_iteration, :input_type,
              :cronline, :days, :days_of_week, :time, :end_time_limited,
              :end_time].freeze
    attr_accessor(*PARAMS)

    before_save do
      if future?
        parse_start_at!
        parse_start_before!
      else
        self.start_at ||= Time.zone.now
      end
    end

    ALLOWED_MODES = [:immediate, :future, :recurring].freeze
    ALLOWED_INPUT_TYPES = [:cronline, :monthly, :weekly, :daily, :hourly].freeze

    TIME_FORMAT = '%Y-%m-%d %H:%M'.freeze
    TIME_REGEXP = /\A\d{4}-\d{2}-\d{2} \d{2}:\d{2}\Z/
    DAYS_REGEXP = /\A(\s*\d{1,2}\s*)(,\s*\d{1,2}\s*)*\Z/

    has_one :recurring_logic, :foreign_key => :triggering_id

    validates :mode, :inclusion => { :in => ALLOWED_MODES,
                                     :message => _('%{value} is not allowed triggering mode') }
    validates :input_type, :if => :recurring?,
                           :inclusion => { :in => ALLOWED_INPUT_TYPES,
                                           :message => _('%{value} is not allowed input type') }
    validates :start_at_raw, format: { :with => TIME_REGEXP, :if => :future?,
                                       :message => _('%{value} is wrong format') }
    validates :start_before_raw, format: { :with => TIME_REGEXP, :if => :future?,
                                           :message => _('%{value} is wrong format'), :allow_blank => true }
    validates :days, format: { :with => DAYS_REGEXP,
                               :if => proc { |t| t.recurring? && t.input_type == :monthly } }
    validate :can_start_recurring, :if => :recurring?
    validate :can_start_future, :if => :future?

    def self.new_from_params(params = {})
      new(params.except(:mode, :start_at, :start_before)).tap do |triggering|
        triggering.mode = params.fetch(:mode, :immediate).to_sym
        triggering.input_type = params.fetch(:input_type, :daily).to_sym
        triggering.end_time_limited = params[:end_time_limited] == 'true'
        triggering.start_at_raw ||= Time.zone.now.strftime(TIME_FORMAT)
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
        recurring_logic.start(action, *args)
      end
    end

    def delay_options
      {
        :start_at => start_at.utc,
        :start_before => start_before.try(:utc)
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
      self.start_at ||= Time.zone.parse(start_at_raw)
    end

    def parse_start_before!
      self.start_before ||= Time.zone.parse(start_before_raw) unless start_before_raw.blank?
    end

    private

    def can_start_recurring
      errors.add(:input_type, _('No task could be started')) unless recurring_logic.valid?
      errors.add(:cronline, _('%s is not valid format of cron line') % cronline) unless recurring_logic.valid_cronline?
    end

    def can_start_future
      parse_start_before!
      parse_start_at!
      errors.add(:start_before_raw, _('The task could not be started')) if !start_before.nil? && start_before < start_at
    end
  end
end
