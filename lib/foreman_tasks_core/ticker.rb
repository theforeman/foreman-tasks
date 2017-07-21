module ForemanTasksCore
  class Ticker < ::Dynflow::Actor

    REFRESH_INTERVAL = 1

    attr_reader :clock

    def initialize(clock, logger, refresh_interval)
      @clock = clock
      @logger = logger
      @events = []
      @refresh_interval = refresh_interval
      plan_next_tick
    end

    def tick
      @logger.debug("Ticker ticking for #{@events.size} events")
      @events.each do |(target, args)|
        pass_event(target, args)
      end
      @events = []
    ensure
      @planned = false
      plan_next_tick
    end

    def add_event(target, args)
      @events << [target, args]
      plan_next_tick
    end

    private

    def pass_event(target, args)
      target.tell(args)
    rescue => e
      @logger.error("Failed passing event to #{target} with #{args}")
      @logger.error(e)
    end

    def plan_next_tick
      if !@planned && !@events.empty?
        @clock.ping(reference, Time.now.getlocal + @refresh_interval, :tick)
        @planned = true
      end
    end
  end
end
