require 'securerandom'

module ForemanTasks
  class Task < ApplicationRecord
    include Authorizable
    extend Search

    def check_permissions_after_save
      # there's no create_tasks permission, tasks are created as a result of internal actions, in such case we
      # don't do authorization, that should have been performed on wrapping action level
      # the same applies for updating
      true
    end

    # TODO: missing validation of states

    self.primary_key = :id
    before_create :generate_id
    before_save :update_state_updated_at

    belongs_to :parent_task, :class_name => 'ForemanTasks::Task'
    has_many :sub_tasks, :class_name => 'ForemanTasks::Task', :foreign_key => :parent_task_id, :dependent => :nullify
    has_many :locks, :dependent => :destroy

    has_many :remote_sub_tasks, :class_name => 'ForemanTasks::RemoteTask', :through => :sub_tasks, :source => :remote_tasks

    has_many :remote_tasks, :class_name => 'ForemanTasks::RemoteTask', :primary_key => :external_id, :foreign_key => :execution_plan_id, :dependent => :destroy

    has_many :task_group_members, :dependent => :destroy
    has_many :task_groups, :through => :task_group_members
    has_many :recurring_logic_task_groups, -> { where :type => 'ForemanTasks::TaskGroups::RecurringLogicTaskGroup' },
             :through => :task_group_members, :source => :task_group
    belongs_to :user
    has_many :links, :dependent => :destroy

    scoped_search :on => :id, :complete_value => false
    scoped_search :on => :action, :complete_value => false
    scoped_search :on => :label, :complete_value => true
    scoped_search :on => :state, :complete_value => true
    scoped_search :on => :result, :complete_value => true
    scoped_search :on => :started_at, :complete_value => false
    scoped_search :on => :state_updated_at, :complete_value => false
    scoped_search :on => :start_at, :complete_value => false
    scoped_search :on => :ended_at, :complete_value => false
    scoped_search :on => :parent_task_id, :complete_value => true
    scoped_search :on => :duration, :complete_value => false, :ext_method => :search_by_duration, :operators => %w[> >= = <= <], :only_explicit => true

    # Note: the following searches may return duplicates, this is due to
    #       one task maybe having multiple locks (e.g. read/write) for the same resource_id
    scoped_search :relation => :locks,  :on => :resource_id, :complete_value => false, :rename => 'locked_location_id', :ext_method => :search_by_taxonomy, :only_explicit => true
    scoped_search :relation => :locks,  :on => :resource_id, :complete_value => false, :rename => 'locked_organization_id', :ext_method => :search_by_taxonomy, :only_explicit => true
    scoped_search :relation => :locks,  :on => :resource_type, :complete_value => true, :rename => 'locked_resource_type', :ext_method => :search_by_generic_resource, :only_explicit => true
    scoped_search :relation => :locks,  :on => :resource_id, :complete_value => false, :rename => 'locked_resource_id', :ext_method => :search_by_generic_resource, :only_explicit => true

    scoped_search :relation => :links,  :on => :resource_id, :complete_value => false, :rename => 'location_id', :ext_method => :search_by_taxonomy, :only_explicit => true
    scoped_search :relation => :links,  :on => :resource_id, :complete_value => false, :rename => 'organization_id', :ext_method => :search_by_taxonomy, :only_explicit => true
    scoped_search :relation => :links,  :on => :resource_type, :complete_value => true, :rename => 'resource_type', :ext_method => :search_by_generic_resource, :only_explicit => true
    scoped_search :relation => :links,  :on => :resource_id, :complete_value => false, :rename => 'resource_id', :ext_method => :search_by_generic_resource, :only_explicit => true

    scoped_search :on => :user_id,
                  :complete_value => true,
                  :rename => 'user.id',
                  :validator => ->(value) { ScopedSearch::Validators::INTEGER.call(value) },
                  :value_translation => ->(value) { value == 'current_user' ? User.current.id : value },
                  :special_values => %w[current_user],
                  :aliases => ['owner.id'], :only_explicit => true
    scoped_search :relation => :user, :on => :login, :complete_value => true, :aliases => ['owner.login', 'user'], :only_explicit => true
    scoped_search :relation => :user, :on => :firstname, :rename => 'user.firstname', :complete_value => true, :aliases => ['owner.firstname'], :only_explicit => true
    scoped_search :relation => :task_groups, :on => :id, :complete_value => true, :rename => 'task_group.id', :validator => ScopedSearch::Validators::INTEGER

    scope :active, -> {  where('foreman_tasks_tasks.state != ?', :stopped) }
    scope :running, -> { where("foreman_tasks_tasks.state NOT IN ('stopped', 'paused')") }
    scope :for_resource,
          (lambda do |resource|
             joins(:links).where(:"foreman_tasks_links.resource_id" => resource.id,
                                 :"foreman_tasks_links.resource_type" => resource.class.name)
           end)
    scope :for_action_types, (->(action_types) { where('foreman_tasks_tasks.label IN (?)', Array(action_types)) })

    apipie :class, "A class representing #{model_name.human} object" do
      name 'Task'
      refs 'Task'
      sections only: %w[all additional]
      property :main_action, object_of: 'Dynflow::Action', desc: 'Returns the main action of the task, e.g. Actions::RemoteExecution::RunHostJob'
      property :label, String, desc: 'Returns the label of the task'
      property :state, String, desc: 'Returns state of the task execution, e.g. "stopped"'
      property :result, String, desc: 'Returns result of the task execution, e.g. "success"'
      property :started_at, ActiveSupport::TimeWithZone, desc: 'Returns date with time the task started at'
      property :ended_at, ActiveSupport::TimeWithZone, desc: 'Returns date with time the task ended at'
    end
    class Jail < Safemode::Jail
      allow :started_at, :ended_at, :result, :state, :label, :main_action, :action_continuous_output
    end

    def input
      {}
    end

    def output
      {}
    end

    def owner
      user
    end

    def username
      owner.try(:login)
    end

    def execution_type
      delayed? ? N_('Delayed') : N_('Immediate')
    end

    def get_humanized(method)
      attr = case method
             when :humanized_name
               :action
             when :humanized_input
               :input
             when :humanized_output
               :output
             end
      if attr
        humanized[attr]
      else
        _('N/A')
      end
    end

    def humanized
      { action: action,
        input:  '',
        output: '' }
    end

    def cli_example
      ''
    end

    # returns true if the task is running or waiting to be run
    def pending?
      state != 'stopped'
    end
    alias pending pending?

    def resumable?
      false
    end

    def paused?
      state == 'paused'
    end

    # returns true if the task is *CURRENTLY* waiting to be executed in the future
    def scheduled?
      state == 'scheduled'
    end

    def recurring?
      !recurring_logic_task_group_ids.empty?
    end

    # returns true if the task was planned to execute in the future
    def delayed?
      start_at.to_i != started_at.to_i
    end

    def self_and_parents
      [self].tap do |ret|
        ret.concat(parent_task.self_and_parents) if parent_task
      end
    end

    # used by Foreman notifications framework
    def notification_recipients_ids
      [owner.id]
    end

    def build_notifications
      notifications = []
      if paused?
        owner = self.owner
        if owner && !owner.hidden?
          notifications << UINotifications::Tasks::TaskPausedOwner.new(self)
        end
        notifications << UINotifications::Tasks::TaskPausedAdmin.new(self)
      end
      notifications
    end

    def progress
      case state.to_s
      when 'running', 'paused'
        0.5
      when 'stopped'
        1
      else
        0
      end
    end

    def self.authorized_resource_name
      # We don't want STI subclasses to have separate permissions
      'ForemanTasks::Task'
    end

    def add_missing_task_groups(groups)
      groups = [groups] unless groups.is_a? Array
      (groups - task_groups).each { |group| task_groups << group }
      save!
    end

    def sub_tasks_counts
      result = %w[cancelled error pending success warning].inject({}) do |hash, state|
        hash.update(state => 0)
      end
      result.update sub_tasks.group(:result).count
      sum = result.values.reduce(:+)
      if respond_to?(:main_action) && main_action.respond_to?(:total_count)
        result[:total] = main_action.total_count
        # In case of batch planning there might be some plans still unplanned (not present in database).
        # To get correct counts we need to add them to either:
        #   cancelled when the parent is stopped
        #   pending when the parent is still running.
        key = state == 'stopped' ? 'cancelled' : 'pending'
        result[key] += result[:total] - sum
      else
        result[:total] = sum
      end
      result.symbolize_keys
    end

    def action
      return to_label if super.blank?
      super
    end

    def to_label
      parts = []
      parts << get_humanized(:name)
      parts << Array(get_humanized(:input)).map do |part|
        if part.is_a? Array
          part[1][:text]
        else
          part.to_s
        end
      end.join('; ')
      parts.join(' ').strip
    end

    def action_continuous_output
      return unless main_action.is_a?(Actions::Helpers::WithContinuousOutput)
      main_action.continuous_output.sort!
      main_action.continuous_output.raw_outputs
    end

    def self.latest_tasks_by_resource_ids(label, resource_type, resource_ids)
      tasks = arel_table
      links = ForemanTasks::Link.arel_table
      started_at = tasks[:started_at]
      resource_id = links[:resource_id]

      base_combined_table = tasks
                            .join(links).on(tasks[:id].eq(links[:task_id]))
                            .where(tasks[:label].eq(label)
                                                .and(links[:resource_type].eq(resource_type))
                                                .and(links[:resource_id].in(resource_ids)))

      grouped = base_combined_table.project(
        started_at.maximum.as('started_at_max'),
        resource_id
      ).group(resource_id).order(resource_id).as('grouped')

      max_per_resource_id = tasks
                            .join(links).on(tasks[:id].eq(links[:task_id]))
                            .join(grouped).on(grouped[:started_at_max].eq(started_at).and(grouped[:resource_id].eq(resource_id)))
                            .distinct
                            .project(tasks[Arel.star], grouped[:resource_id])

      find_by_sql(max_per_resource_id.to_sql).index_by(&:resource_id)
    end

    protected

    def generate_id
      self.id ||= SecureRandom.uuid
    end

    def update_state_updated_at
      self.state_updated_at = Time.now.utc if changes.key?(:state)
    end
  end
end
