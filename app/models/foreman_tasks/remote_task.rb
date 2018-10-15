module ForemanTasks
  class RemoteTask < ApplicationRecord
    attr_accessor :result

    belongs_to :task, :class_name  => 'ForemanTasks::Task',
                      :primary_key => :external_id,
                      :foreign_key => :execution_plan_id,
                      :inverse_of  => :remote_tasks

    scope :triggered, -> { where(:state => 'triggered') }
    scope :pending,   -> { where(:state => 'new') }

    delegate :proxy_action_name, :to => :action

    def trigger(input)
      response = proxy.trigger_task(proxy_action_name, input)
      self.remote_task_id = response['task_id']
      self.state = 'triggered'
      save!
    end

    def self.batch_trigger(remote_tasks, action_name)
      remote_tasks.group_by(&:proxy_url).values.map do |group|
        input_hash = group.reduce({}) do |acc, cur|
          acc.update(cur.execution_plan_id => { :action_input => cur.proxy_input, :action_class => cur.proxy_action_name })
        end
        safe_batch_trigger(group, action_name, input_hash)
      end
      remote_tasks
    end

    def self.safe_batch_trigger(remote_tasks, batch_action_name, input_hash)
      results = remote_tasks.first.proxy.trigger_tasks(:action_name => batch_action_name, :action_input => input_hash)
      group.each { |remote_task| remote_task.update_from_batch_trigger results[remote_task.execution_plan_id] }
    rescue RestClient::NotFound
      fallback_batch_trigger remote_tasks, input_hash
    end

    def self.fallback_batch_trigger(remote_tasks, input_hash)
      remote_tasks.each do |remote_task|
        remote_task.trigger(input_hash[remote_task.execution_plan_id][:action_input])
      end
    end

    def update_from_batch_trigger(data)
      if data['result'] == 'success'
        self.remote_task_id = data['task_id']
        self.state = 'triggered'
      else
        # Tell the action the task on the smart proxy stopped
        ForemanTasks::Dynflow.world.event execution_plan_id,
                                          step_id,
                                          ::Actions::ProxyAction::ProxyActionStopped.new
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
