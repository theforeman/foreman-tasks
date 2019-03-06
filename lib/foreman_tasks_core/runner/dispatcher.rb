require 'foreman_tasks_core/ticker'

module ForemanTasksCore
  module Runner
    class Dispatcher
      def self.instance
        return @instance if @instance
        @instance = new(ForemanTasksCore.dynflow_world.clock,
                        ForemanTasksCore.dynflow_world.logger)
      end

      class RunnerActor < ::Dynflow::Actor
        def initialize(dispatcher, suspended_action, runner, clock, logger, _options = {})
          @dispatcher = dispatcher
          @clock = clock
          @ticker = dispatcher.ticker
          @logger = logger
          @suspended_action = suspended_action
          @runner = runner
          @finishing = false
        end

        def on_envelope(*args)
          super
        rescue => e
          handle_exception(e)
        end

        def start_runner
          @logger.debug("start runner #{@runner.id}")
          set_timeout if @runner.timeout_interval
          @runner.start
          refresh_runner
        ensure
          plan_next_refresh
        end

        def refresh_runner
          @logger.debug("refresh runner #{@runner.id}")
          updates = @runner.run_refresh

          updates.each { |receiver, update| (receiver || @suspended_action) << update }

          # This is a workaround when the runner does not accept the suspended action
          main_key = updates.keys.any?(&:nil?) ? nil : @suspended_action
          main_process = updates[main_key]
          finish if main_process && main_process.exit_status
        ensure
          @refresh_planned = false
          plan_next_refresh
        end

        def timeout_runner
          @logger.debug("timeout runner #{@runner.id}")
          @runner.timeout
        rescue => e
          handle_exception(e, false)
        end

        def kill
          @logger.debug("kill runner #{@runner.id}")
          @runner.kill
        rescue => e
          handle_exception(e, false)
        end

        def finish
          @logger.debug("finish runner #{@runner.id}")
          @finishing = true
          @dispatcher.finish(@runner.id)
        end

        def start_termination(*args)
          @logger.debug("terminate #{@runner.id}")
          super
          @runner.close
          finish_termination
        end

        def external_event(_event)
          refresh_runner
        end

        private

        def set_timeout
          timeout_time = Time.now.getlocal + @runner.timeout_interval
          @logger.debug("setting timeout for #{@runner.id} to #{timeout_time}")
          @clock.ping(reference, timeout_time, :timeout_runner)
        end

        def plan_next_refresh
          if !@finishing && !@refresh_planned
            @logger.debug("planning to refresh #{@runner.id}")
            @ticker.tell([:add_event, reference, :refresh_runner])
            @refresh_planned = true
          end
        end

        def handle_exception(exception, fatal = true)
          @dispatcher.handle_command_exception(@runner.id, exception, fatal)
        end
      end

      attr_reader :ticker
      def initialize(clock, logger)
        @mutex  = Mutex.new
        @clock  = clock
        @logger = logger
        @ticker = ::ForemanTasksCore::Ticker.spawn('dispatcher-ticker', @clock, @logger, refresh_interval)
        @runner_actors = {}
        @runner_suspended_actions = {}
      end

      def synchronize(&block)
        @mutex.synchronize(&block)
      end

      def start(suspended_action, runner)
        synchronize do
          begin
            raise "Actor with runner id #{runner.id} already exists" if @runner_actors[runner.id]
            runner.logger = @logger
            runner_actor = RunnerActor.spawn("runner-actor-#{runner.id}", self, suspended_action, runner, @clock, @logger)
            @runner_actors[runner.id] = runner_actor
            @runner_suspended_actions[runner.id] = suspended_action
            runner_actor.tell(:start_runner)
            return runner.id
          rescue => exception
            _handle_command_exception(runner.id, exception)
            return nil
          end
        end
      end

      def kill(runner_id)
        synchronize do
          begin
            runner_actor = @runner_actors[runner_id]
            runner_actor.tell(:kill) if runner_actor
          rescue => exception
            _handle_command_exception(runner_id, exception, false)
          end
        end
      end

      def finish(runner_id)
        synchronize do
          begin
            _finish(runner_id)
          rescue => exception
            _handle_command_exception(runner_id, exception, false)
          end
        end
      end

      def external_event(runner_id, external_event)
        synchronize do
          runner_actor = @runner_actors[runner_id]
          runner_actor.tell([:external_event, external_event]) if runner_actor
        end
      end

      def handle_command_exception(*args)
        synchronize { _handle_command_exception(*args) }
      end

      def refresh_interval
        1
      end

      private

      def _finish(runner_id)
        runner_actor = @runner_actors.delete(runner_id)
        return unless runner_actor
        @logger.debug("closing session for command [#{runner_id}]," \
                      "#{@runner_actors.size} actors left ")
        runner_actor.tell([:start_termination, Concurrent::Promises.resolvable_future])
      ensure
        @runner_suspended_actions.delete(runner_id)
      end

      def _handle_command_exception(runner_id, exception, fatal = true)
        @logger.error("error while dispatching request to runner #{runner_id}:"\
                      "#{exception.class} #{exception.message}:\n #{exception.backtrace.join("\n")}")
        suspended_action = @runner_suspended_actions[runner_id]
        if suspended_action
          suspended_action << Runner::Update.encode_exception('Runner error', exception, fatal)
        end
        _finish(runner_id) if fatal
      end
    end
  end
end
