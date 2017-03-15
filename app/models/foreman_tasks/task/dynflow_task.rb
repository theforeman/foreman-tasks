module ForemanTasks
  class Task::DynflowTask < ForemanTasks::Task
    include Algebrick::TypeCheck

    after_commit :pull_update_from_dynflow

    delegate :cancellable?, :progress, to: :execution_plan
    scope :for_action, ->(action_class) { where(label: action_class.name) }

    def pull_update_from_dynflow
      execution_plan.save unless (state == execution_plan.state.to_s)
    end

    def update_from_dynflow(data)
      utc_zone = ActiveSupport::TimeZone.new('UTC')
      self.external_id    = data[:id]
      self.started_at     = utc_zone.parse(data[:started_at]) unless data[:started_at].nil?
      self.ended_at       = utc_zone.parse(data[:ended_at]) unless data[:ended_at].nil?
      self.state          = data[:state].to_s
      self.result         = data[:result].to_s
      self.start_at       = utc_zone.parse(data[:start_at]) if data[:start_at]
      self.start_before   = utc_zone.parse(data[:start_before]) if data[:start_before]
      self.parent_task_id ||= begin
                                if main_action.caller_execution_plan_id
                                  DynflowTask.where(:external_id => main_action.caller_execution_plan_id).first!.id
                                end
                              end
      self.label          ||= main_action.class.name
      changes = self.changes
      save!
      changes
    end

    def cancel
      execution_plan.cancel.any?
    end

    def resumable?
      execution_plan.state == :paused
    end

    def cancellable_action?(action)
      action.is_a?(::Dynflow::Action::Cancellable)
    end

    def execution_plan
      @execution_plan ||= ForemanTasks.dynflow.world.persistence.load_execution_plan(external_id)
    end

    def input
      main_action.respond_to?(:task_input) && main_action.task_input
    end

    def output
      main_action.respond_to?(:task_output) && main_action.task_output
    end

    def failed_steps
      execution_plan.steps_in_state(:skipped, :skipping, :error)
    end

    def running_steps
      execution_plan.steps_in_state(:running, :suspended)
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
      return @main_action if @main_action
      execution_plan.root_plan_step.action execution_plan
    end

    def get_humanized(method)
      @humanized_cache ||= {}
      if [:name, :input, :output, :error].include?(method)
        method = "humanized_#{method}".to_sym
      end
      Match! method, :humanized_name, :humanized_input, :humanized_output, :humanized_errors
      return N_('N/A') if method != :humanized_name && main_action.execution_plan.state == :scheduled
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
  end
end
