module ForemanTasks
  class Triggering < ActiveRecord::Base
    PARAMS = [:start_at_raw, :start_before_raw, :max_iteration, :input_type,
              :cronline, :days, :days_of_week, :time, :end_time_limited,
              :end_time]
    attr_accessor *PARAMS
    attr_accessible *PARAMS

    before_save do
      if future?
        parse_start_at!
        parse_start_before!
      end
    end

    after_find do |triggering|
      triggering.mode = triggering.mode.to_sym
    end

    ALLOWED_MODES = [:immediate, :future, :recurring]
    ALLOWED_INPUT_TYPES = [:cronline, :monthly, :weekly, :daily, :hourly]

    TIME_FORMAT = "%Y-%m-%d %H:%M"
    TIME_REGEXP = /\A\d{4}-\d{2}-\d{2} \d{2}:\d{2}\Z/
    DAYS_REGEXP = /\A(\s*\d{1,2}\s*)(,\s*\d{1,2}\s*)*\Z/

    has_one :recurring_logic, :foreign_key => :triggering_id

    validates :mode, :inclusion => { :in => ALLOWED_MODES,
                                     :message => _("%{value} is not allowed triggering mode")  }
    validates :input_type, :if => :recurring?,
              :inclusion => { :in => ALLOWED_INPUT_TYPES,
                              :message => _("%{value} is not allowed input type") }
    validates_format_of :start_at_raw, :with => TIME_REGEXP, :if => :future?,
                        :message => _("%{value} is wrong format")
    validates_format_of :start_before_raw, :with => TIME_REGEXP, :if => :future?,
                        :message => _("%{value} is wrong format"), :allow_blank => true
    validates_format_of :days, :with => DAYS_REGEXP,
                        :if => Proc.new { |t| t.recurring? && t.input_type == :monthly }
    validate :correct_cronline, :if => Proc.new { |t| t.recurring? && t.input_type == :cronline }

    def self.new_from_params(params = {})
      self.new(params.except(:mode, :start_at, :start_before)).tap do |triggering|
        triggering.mode = params.fetch(:mode, :immediate).to_sym
        triggering.input_type = params.fetch(:input_type, :daily).to_sym
        triggering.end_time_limited = params[:end_time_limited] == "true"
        triggering.start_at_raw ||= Time.now.strftime(TIME_FORMAT)
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
        ::ForemanTasks::RecurringLogic.new_from_triggering(self)
        .start(action, *args)
      end
    end

    def delay_options
      {
        :start_at => start_at,
        :start_before => start_before
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
      self.start_at ||= Time.strptime(start_at_raw, TIME_FORMAT)
    end

    def parse_start_before!
      self.start_before ||= Time.strptime(start_before_raw, TIME_FORMAT) unless start_before_raw.blank?
    end

    private

    def correct_cronline
      ForemanTasks::RecurringLogic.new_from_cronline(cronline).next_occurrence_time
    rescue ArgumentError => _
      self.errors.add(:cronline, _("#{cronline} is not valid format of cronline"))
    end
  end
end
