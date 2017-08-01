module ForemanTasks
  class Task::DynflowTask < ForemanTasks::Task
    include Algebrick::TypeCheck

    scope :for_action, ->(action_class) { where(label: action_class.name) }

    def update_from_dynflow(data)
      utc_zone = ActiveSupport::TimeZone.new('UTC')
      self.external_id    = data[:id]
      self.started_at     = utc_zone.parse(data[:started_at]) unless data[:started_at].nil?
      self.ended_at       = utc_zone.parse(data[:ended_at]) unless data[:ended_at].nil?
      self.result         = map_result(data).to_s
      self.state          = data[:state].to_s
      self.start_at       = utc_zone.parse(data[:start_at]) if data[:start_at]
      self.start_before   = utc_zone.parse(data[:start_before]) if data[:start_before]
      self.parent_task_id ||= begin
                                if main_action.caller_execution_plan_id
                                  DynflowTask.where(:external_id => main_action.caller_execution_plan_id).first!.id
                                end
                              end
      self.label          ||= main_action && main_action.class.name
      changes = self.changes
      save!
      changes
    end

    def cancellable?
      execution_plan.try(:cancellable?)
    end

    def cancel
      execution_plan!.cancel.any?
    end

    def abort
      execution_plan!.cancel(true).any?
    end

    def resumable?
      execution_plan.try(:state) == :paused
    end

    def cancellable_action?(action)
      action.is_a?(::Dynflow::Action::Cancellable)
    end

    def progress
      execution_plan.try(:progress) || 0
    end

    def execution_plan(silence_exception = true)
      return @execution_plan if defined?(@execution_plan)
      execution_plan = ForemanTasks.dynflow.world.persistence.load_execution_plan(external_id)
      # don't use invalid execution plans for our purposes
      if execution_plan.respond_to?(:valid?) && !execution_plan.valid?
        raise execution_plan.exception
      else
        @execution_plan = execution_plan
      end
      @execution_plan
    rescue => e
      Foreman::Logging.exception("Could not load execution plan #{external_id} for task #{id}", e, :logger => 'foreman-tasks')
      raise e unless silence_exception
      nil
    end

    def execution_plan!
      execution_plan(false)
    end

    def input
      main_action.respond_to?(:task_input) && main_action.task_input
    end

    def output
      main_action.respond_to?(:task_output) && main_action.task_output
    end

    def failed_steps
      execution_plan.try(:steps_in_state, :skipped, :skipping, :error) || []
    end

    def running_steps
      execution_plan.try(:steps_in_state, :running, :suspended) || []
    end

    def humanized
      { action: get_humanized(:humanized_name),
        input:  get_humanized(:humanized_input),
        output: get_humanized(:humanized_output),
        errors: get_humanized(:humanized_errors) }
    end

    def cli_example
      main_action.cli_example if main_action.respond_to?(:cli_example)
    end

    def main_action
      return @main_action if defined?(@main_action)
      @main_action = execution_plan && execution_plan.root_plan_step.try(:action, execution_plan)
    end

    def get_humanized(method)
      @humanized_cache ||= {}
      if [:name, :input, :output, :error].include?(method)
        method = "humanized_#{method}".to_sym
      end
      Match! method, :humanized_name, :humanized_input, :humanized_output, :humanized_errors
      return N_('N/A') if method != :humanized_name && (main_action.nil? || main_action.execution_plan.state == :scheduled)
      return N_(label) if method == :humanized_name && main_action.nil?
      @humanized_cache[method] ||= begin
                                     if main_action.respond_to? method
                                       begin
                                         main_action.send method
                                       rescue Exception => error # rubocop:disable Lint/RescueException
                                         "#{error.message} (#{error.class})\n#{error.backtrace.join "\n"}"
                                       end
                                     end
                                   end
    end

    def self.consistency_check
      fixed_count = 0
      logger = Foreman::Logging.logger('foreman-tasks')
      running.each do |task|
        begin
          changes = task.update_from_dynflow(task.execution_plan.to_hash)
          unless changes.empty?
            fixed_count += 1
            logger.warn('Task %s updated at consistency check: %s' % [task.id, changes.inspect])
          end
        rescue => e
          # if we fail updating the data from dynflow, it usually means there is something
          # odd with the data consistency and at this point it is not possible to resume, switching
          # the task to stopped/error
          task.update_attributes(:state => 'stopped', :result => 'error')
          Foreman::Logging.exception("Failed at consistency check for task #{task.id}", e, :logger => 'foreman-tasks')
        end
      end
      fixed_count
    end

    def self.new_for_execution_plan(execution_plan_id, data)
      new(:external_id => execution_plan_id,
          :state => data[:state].to_s,
          :result => data[:result].to_s)
    end

    def self.model_name
      superclass.model_name
    end

    private

    def map_result(data)
      if state_result_transitioned?(['planned', 'pending'], ['stopped', 'error'], data) ||
          (data[:result] == :error && cancelled?)
        :cancelled
      else
        data[:result]
      end
    end

    def state_result_transitioned?(from, to, data)
      oldstate, oldresult = from
      newstate, newresult = to
      state == oldstate && data[:state].to_s == newstate &&
        result == oldresult && data[:result].to_s == newresult
    end

    def cancelled?
      execution_plan.errors.any? { |error| error.exception_class == ::ForemanTasks::Task::TaskCancelledException }
    end
  end
end
