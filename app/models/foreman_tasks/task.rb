require 'securerandom'

module ForemanTasks
  class Task < ActiveRecord::Base
    include Authorizable

    def check_permissions_after_save
      # there's no create_tasks permission, tasks are created as a result of internal actions, in such case we
      # don't do authorization, that should have been performed on wrapping action level
      if id_changed?
        true
      else
        super
      end
    end

    # TODO: missing validation of states

    self.primary_key = :id
    before_create :generate_id

    belongs_to :parent_task, :class_name => 'ForemanTasks::Task'
    has_many :sub_tasks, :class_name => 'ForemanTasks::Task', :foreign_key => :parent_task_id
    has_many :locks

    has_many :task_group_members
    has_many :task_groups, :through => :task_group_members
    if Rails::VERSION::MAJOR < 4
      has_many :recurring_logic_task_groups, :through => :task_group_members, :conditions => { :type => 'ForemanTasks::TaskGroups::RecurringLogicTaskGroup' }, :source => :task_group
      has_many :owners, :through => :locks, :source => :resource, :source_type => 'User',
                        :conditions => ['foreman_tasks_locks.name = ?', Lock::OWNER_LOCK_NAME]
    else
      has_many :recurring_logic_task_groups, -> { where :type => 'ForemanTasks::TaskGroups::RecurringLogicTaskGroup' },
               :through => :task_group_members, :source => :task_group
      # in fact, the task has only one owner but Rails don't let you to
      # specify has_one relation though has_many relation
      has_many :owners, -> { where(['foreman_tasks_locks.name = ?', Lock::OWNER_LOCK_NAME]) },
               :through => :locks, :source => :resource, :source_type => 'User'
    end

    scoped_search :on => :id, :complete_value => false
    scoped_search :on => :label, :complete_value => true
    scoped_search :on => :state, :complete_value => true
    scoped_search :on => :result, :complete_value => true
    scoped_search :on => :started_at, :complete_value => false
    scoped_search :on => :start_at, :complete_value => false
    scoped_search :on => :ended_at, :complete_value => false
    scoped_search :on => :parent_task_id, :complete_value => true
    scoped_search :relation => :locks,  :on => :resource_type, :complete_value => true, :rename => 'resource_type', :ext_method => :search_by_generic_resource
    scoped_search :relation => :locks,  :on => :resource_id, :complete_value => false, :rename => 'resource_id', :ext_method => :search_by_generic_resource
    scoped_search :relation => :owners,  
                  :on => :id, 
                  :complete_value => true, 
                  :rename => 'owner.id', 
                  :ext_method => :search_by_owner,
                  :validator => ->(value) { ScopedSearch::Validators::INTEGER.call(value) || value == 'current_user' }
    scoped_search :relation => :owners,  :on => :login, :complete_value => true, :rename => 'owner.login', :ext_method => :search_by_owner
    scoped_search :relation => :owners,  :on => :firstname, :complete_value => true, :rename => 'owner.firstname', :ext_method => :search_by_owner
    scoped_search :relation => :task_groups, :on => :id, :complete_value => true, :rename => 'task_group.id', :validator => ScopedSearch::Validators::INTEGER

    scope :active, -> {  where('foreman_tasks_tasks.state != ?', :stopped) }
    scope :running, -> { where("foreman_tasks_tasks.state NOT IN ('stopped', 'paused')") }
    scope :for_resource,
          (lambda do |resource|
             joins(:locks).where(:"foreman_tasks_locks.resource_id" => resource.id,
                                 :"foreman_tasks_locks.resource_type" => resource.class.name)
           end)
    scope :for_action_types, (->(action_types) { where('foreman_tasks_tasks.label IN (?)', Array(action_types)) })

    def input
      {}
    end

    def output
      {}
    end

    def owner
      owners.first
    end

    def username
      owner.try(:login)
    end

    def execution_type
      delayed? ? N_('Delayed') : N_('Immediate')
    end

    def humanized
      { action: label,
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

    def recurring?
      !recurring_logic_task_group_ids.empty?
    end

    def delayed?
      start_at.to_i != started_at.to_i
    end

    def self_and_parents
      [self].tap do |ret|
        ret.concat(parent_task.self_and_parents) if parent_task
      end
    end

    def self.search_by_generic_resource(key, operator, value)
      key = 'resource_type' if key.blank?
      key_name = connection.quote_column_name(key.sub(/^.*\./, ''))
      condition = sanitize_sql_for_conditions(["foreman_tasks_locks.#{key_name} #{operator} ?", value])

      { :conditions => condition, :joins => :locks }
    end

    def self.search_by_owner(key, operator, value)
      return { :conditions => '0 = 1' } if value == 'current_user' && User.current.nil?

      key_name = connection.quote_column_name(key.sub(/^.*\./, ''))
      joins = <<-SQL
      INNER JOIN foreman_tasks_locks AS foreman_tasks_locks_owner
                 ON (foreman_tasks_locks_owner.task_id = foreman_tasks_tasks.id AND
                     foreman_tasks_locks_owner.resource_type = 'User' AND
                     foreman_tasks_locks_owner.name = '#{Lock::OWNER_LOCK_NAME}')
      SQL
      if key !~ /\.id\Z/
        joins << <<-SQL
        INNER JOIN users
                   ON (users.id = foreman_tasks_locks_owner.resource_id)
        SQL
      end
      condition = if key.blank?
                    sanitize_sql_for_conditions(["users.login #{operator} ? or users.firstname #{operator} ? ", value, value])
                  elsif key =~ /\.id\Z/
                    value = User.current.id if value == 'current_user'
                    sanitize_sql_for_conditions(["foreman_tasks_locks_owner.resource_id #{operator} ?", value])
                  else
                    sanitize_sql_for_conditions(["users.#{key_name} #{operator} ?", value])
                  end
      { :conditions => condition, :joins => joins }
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
    end

    def sub_tasks_counts
      result = %w(cancelled error pending success warning).zip([0].cycle).to_h
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

    protected

    def generate_id
      self.id ||= SecureRandom.uuid
    end
  end
end
