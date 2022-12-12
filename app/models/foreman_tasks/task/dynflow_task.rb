module ForemanTasks
  class Task::DynflowTask < ForemanTasks::Task
    include Algebrick::TypeCheck

    scope :for_action, ->(action_class) { where(label: action_class.name) }
    after_validation :set_action_field

    def update_from_dynflow(plan, delayed_plan = nil)
      self.external_id    = plan.id
      self.result         = map_result(plan).to_s
      self.state          = plan.state.to_s
      self.started_at     = plan.started_at unless plan.started_at.nil?
      self.ended_at       = plan.ended_at unless plan.ended_at.nil?
      self.start_at       = delayed_plan.start_at if delayed_plan
      self.start_before   = delayed_plan.start_before if delayed_plan
      self.parent_task_id ||= begin
                                if main_action.try(:caller_execution_plan_id)
                                  DynflowTask.where(:external_id => main_action.caller_execution_plan_id).first!.id
                                end
                              end
      self[:label]        ||= label
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
      progress_raw = execution_plan.try(:progress) || 0
      progress_raw.round(2)
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

    def frozen
      delayed_plan.try(:frozen)
    end

    def delayed_plan
      ForemanTasks.dynflow.world.persistence.load_delayed_plan(external_id) if state == :scheduled
    end

    def execution_plan!
      execution_plan(false)
    end

    def label
      return main_action.class.name if main_action.present?
      self[:label]
    end

    def input
      return active_job_data['arguments'] if active_job?
      main_action.task_input if main_action.respond_to?(:task_input)
    end

    def output
      main_action.task_output if main_action.respond_to?(:task_output)
    end

    def failed_steps
      execution_plan.try(:steps_in_state, :skipped, :skipping, :error) || []
    end

    def running_steps
      execution_plan.try(:steps_in_state, :running, :suspended) || []
    end

    def input_output_failed_steps
      failed_steps.map do |f|
        f_action = f.action(execution_plan)
        {
          error: ({ exception_class: f.error.exception_class, message: f.error.message, backtrace: f.error.backtrace } if f.error),
          action_class: f.action_class.name,
          state: f.state,
          input: f_action.input.pretty_inspect,
          output: f_action.output.pretty_inspect,
        }
      end
    end

    def input_output_running_steps
      running_steps.map do |f|
        f_action = f.action(execution_plan)
        {
          id: f_action.id,
          action_class: f.action_class.name,
          state: f.state,
          input: f_action.input.pretty_inspect,
          output: f_action.output.pretty_inspect,
          cancellable: cancellable_action?(f_action),
        }
      end
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
      if active_job?
        job_data = active_job_data
        begin
          @main_action = active_job_action(job_data['job_class'], job_data['arguments'])
        rescue => e
          Foreman::Logging.exception("Failed to load ActiveJob for task #{id}", e, :logger => 'foreman-tasks')
        end
      end
      @main_action
    end

    # The class for ActiveJob jobs in Dynflow, JobWrapper is not expected to
    # implement any humanized actions. Individual jobs are expected to implement
    # humanized_* methods for foreman-tasks integration.
    def active_job_action(klass, args)
      return if klass.blank?
      if (active_job_class = klass.safe_constantize)
        active_job_class.new(*args)
      end
    end

    def active_job?
      return false unless execution_plan.present? &&
                          execution_plan.root_plan_step.present?
      execution_plan_action.class == ::Dynflow::ActiveJob::QueueAdapters::JobWrapper
    end

    def active_job_data
      args = if execution_plan.delay_record
               execution_plan.delay_record.args.first
             else
               execution_plan_action.input
             end
      return args['job_data'] if args.key?('job_data')
      # For dynflow <= 1.2.1
      { 'job_class' => args['job_class'], 'arguments' => args['job_arguments'] }
    end

    def execution_plan_action
      execution_plan.root_plan_step.action(execution_plan)
    end

    def execution_scheduled?
      main_action.nil? || main_action.respond_to?(:execution_plan) &&
        main_action.execution_plan.state == :scheduled ||
        execution_plan.state == :scheduled
    end

    def get_humanized(method)
      @humanized_cache ||= {}
      method = find_humanize_method_kind(method)
      Match! method, :humanized_name, :humanized_input, :humanized_output, :humanized_errors
      if method != :humanized_name && execution_scheduled?
        return
      elsif method == :humanized_name && main_action.nil?
        return N_(label)
      end
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

    def find_humanize_method_kind(method)
      return method if /humanized_.*/ =~ method
      if [:name, :input, :output, :error].include?(method)
        "humanized_#{method}".to_sym
      end
    end

    def self.consistency_check
      fixed_count = 0
      logger = Foreman::Logging.logger('foreman-tasks')

      # Dynflow execution plans which are not stopped at this point should
      # eventually get moving and their tasks should eventually get back in sync
      # as the execution plans run
      joins('LEFT JOIN dynflow_execution_plans ON foreman_tasks_tasks.external_id = dynflow_execution_plans.uuid::varchar')
        .where('foreman_tasks_tasks.state_updated_at < dynflow_execution_plans.ended_at')
        .find_each do |task|
        changes = task.update_from_dynflow(task.execution_plan.to_hash)
        unless changes.empty?
          fixed_count += 1
          logger.warn('Task %s updated at consistency check: %s' % [task.id, changes.inspect])
        end
      rescue => e
        task.update(:state => 'stopped', :result => 'error')
        Foreman::Logging.exception("Failed at consistency check for task #{task.id}", e, :logger => 'foreman-tasks')
      end
      # Wipe tasks left behind by now stopped tasks
      ForemanTasks::Lock.left_joins(:task).merge(where(:state => 'stopped')).destroy_all
      fixed_count
    end

    def self.new_for_execution_plan(execution_plan)
      new(:external_id => execution_plan.id,
          :state => execution_plan.state.to_s,
          :result => execution_plan.result.to_s,
          :user_id => User.current.try(:id))
    end

    def self.model_name
      superclass.model_name
    end

    private

    def string_to_time(zone, time)
      return time if time.is_a?(Time)
      zone.parse(time)
    end

    def set_action_field
      self.action = to_label
    end

    def map_result(plan)
      if state_result_transitioned?(%w[planned pending], %w[stopped error], plan) ||
         (plan.result == :error && cancelled?)
        :cancelled
      else
        plan.result
      end
    end

    def state_result_transitioned?(from, to, plan)
      oldstate, oldresult = from
      newstate, newresult = to
      state == oldstate && plan.state.to_s == newstate &&
        result == oldresult && plan.result.to_s == newresult
    end

    def cancelled?
      execution_plan.errors.any? { |error| error.exception_class == ::ForemanTasks::Task::TaskCancelledException }
    end
  end
end
