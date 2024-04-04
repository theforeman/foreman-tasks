module ForemanTasks
  class RemoteTask < ApplicationRecord
    attr_accessor :result

    belongs_to :task, :class_name  => 'ForemanTasks::Task',
                      :primary_key => :external_id,
                      :foreign_key => :execution_plan_id,
                      :inverse_of  => :remote_tasks

    scope :triggered, -> { where(:state => ['triggered', 'parent-triggered']) }
    scope :pending,   -> { where(:state => 'new') }
    scope :external,  -> { where(:state => 'external') }

    delegate :proxy_action_name, :to => :action

    def self.batch_trigger(operation, remote_tasks)
      remote_tasks.group_by(&:proxy_url).each_value do |group|
        input_hash = group.reduce({}) do |acc, remote_task|
          acc.merge(remote_task.execution_plan_id => { :action_input => remote_task.proxy_input,
                                                       :action_class => remote_task.proxy_action_name })
        end
        results = group.first.proxy.launch_tasks(operation, input_hash)
        group.each do |remote_task|
          remote_task.update_from_batch_trigger results.fetch(remote_task.execution_plan_id, {}),
                                                results.fetch('parent', {})
        end
      end
      remote_tasks
    end

    def update_from_batch_trigger(data, parent = {})
      # The ID might get overwritten later, but it is a sane default in case of async
      # triggering where we only get an id of a remote parent
      self.remote_task_id = execution_plan_id
      if data['result'] == 'success'
        self.remote_task_id = data['task_id']
        self.state = 'triggered'
      elsif !parent.empty?
        self.parent_task_id = parent['task_id']
        self.state = 'parent-triggered'
      else
        exception = data['exception']
        # Tell the action the task on the smart proxy stopped
        ForemanTasks.dynflow.world.event execution_plan_id,
                                         step_id,
                                         ::Actions::ProxyAction::ProxyActionStoppedEvent[exception],
                                         optional: true
      end
      save!
    end

    def proxy_input
      action.proxy_input(task.id)
    end

    def proxy
      @proxy ||= ::ProxyAPI::ForemanDynflow::DynflowProxy.new(:url => proxy_url)
    end

    private

    def action
      @action ||= ForemanTasks.dynflow.world.persistence.load_action(step)
    end

    def step
      @step ||= task.execution_plan.steps[step_id]
    end
  end
end
