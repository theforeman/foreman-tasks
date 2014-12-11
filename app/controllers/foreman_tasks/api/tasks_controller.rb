#
# Copyright 2013 Red Hat, Inc.
#
# This software is licensed to you under the GNU General Public
# License as published by the Free Software Foundation; either version
# 2 of the License (GPLv2) or (at your option) any later version.
# There is NO WARRANTY for this software, express or implied,
# including the implied warranties of MERCHANTABILITY,
# NON-INFRINGEMENT, or FITNESS FOR A PARTICULAR PURPOSE. You should
# have received a copy of GPLv2 along with this software; if not, see
# http://www.gnu.org/licenses/old-licenses/gpl-2.0.txt.

module ForemanTasks
  module Api
    class TasksController < ::Api::V2::BaseController

      resource_description do
        resource_id 'foreman_tasks'
        api_version 'v2'
        api_base_url "/foreman_tasks/api"
      end

      # Foreman right now doesn't have mechanism to
      # cause general BadRequest handling, resuing the Apipie::ParamError
      # for now http://projects.theforeman.org/issues/3957
      class BadRequest < Apipie::ParamError
      end

      before_filter :find_task, :only => [:show]

      api :GET, "/tasks/:id", "Show task details"
      param :id, :identifier, desc: "UUID of the task"
      def show
      end

      api :POST, "/tasks/bulk_search", "List dynflow tasks for uuids"
      param :searches, Array, :desc => 'List of uuids to fetch info about' do
        param :search_id, String, :desc => <<-DESC
          Arbitraty value for client to identify the the request parts with results.
          It's passed in the results to be able to pair the requests and responses properly.
        DESC
        param :type, %w[user resource task]
        param :task_id, String, :desc => <<-DESC
          In case :type = 'task', find the task by the uuid
        DESC
        param :user_id, String, :desc => <<-DESC
          In case :type = 'user', find tasks for the user
        DESC
        param :resource_type, String, :desc => <<-DESC
          In case :type = 'resource', what resource type we're searching the tasks for
        DESC
        param :resource_type, String, :desc => <<-DESC
          In case :type = 'resource', what resource id we're searching the tasks for
        DESC
        param :action_types, [String], :desc => <<-DESC
          Return just tasks of given action type, e.g. ["Actions::Katello::Repository::Synchronize"]
        DESC
        param :active_only, :bool
        param :page, String
        param :per_page, String
      end
      desc <<-DESC
        For every search it returns the list of tasks that satisfty the condition.
        The reason for supporting multiple searches is the UI that might be ending
        needing periodic updates on task status for various searches at the same time.
        This way, it is possible to get all the task statuses with one request.
      DESC
      def bulk_search
        searches = Array(params[:searches])
        @tasks   = {}

        ret = searches.map do |search_params|
          { search_params: search_params,
            results:       search_tasks(search_params) }
        end
        render :json => ret
      end

      private

      def search_tasks(search_params)
        scope = ::ForemanTasks::Task.select('DISTINCT foreman_tasks_tasks.*')
        scope = ordering_scope(scope, search_params)
        scope = search_scope(scope, search_params)
        scope = active_scope(scope, search_params)
        scope = action_types_scope(scope, search_params)
        scope = pagination_scope(scope, search_params)
        scope.all.map { |task| task_hash(task) }
      end

      def search_scope(scope, search_params)
        case search_params[:type]
        when 'all'
          scope
        when 'user'
          if search_params[:user_id].blank?
            raise BadRequest, _("User search_params requires user_id to be specified")
          end
          scope.joins(:locks).where(foreman_tasks_locks:
                                        { name:          ::ForemanTasks::Lock::OWNER_LOCK_NAME,
                                          resource_type: 'User',
                                          resource_id:   search_params[:user_id] })
        when 'resource'
          if search_params[:resource_type].blank? || search_params[:resource_id].blank?
            raise BadRequest,
                  _("Resource search_params requires resource_type and resource_id to be specified")
          end
          scope.joins(:locks).where(foreman_tasks_locks:
                                        { resource_type: search_params[:resource_type],
                                          resource_id:   search_params[:resource_id] })
        when 'task'
          if search_params[:task_id].blank?
            raise BadRequest, _("Task search_params requires task_id to be specified")
          end
          scope.where(id: search_params[:task_id])
        else
          raise BadRequest, _("Search_Params %s not supported") % search_params[:type]
        end
      end

      def active_scope(scope, search_params)
        if search_params[:active_only]
          scope.active
        else
          scope
        end
      end

      def action_types_scope(scope, search_params)
        if action_types = search_params[:action_types]
          scope.for_action_types(action_types)
        else
          scope
        end
      end

      def pagination_scope(scope, search_params)
        page     = search_params[:page] || 1
        per_page = search_params[:per_page] || 10
        scope    = scope.limit(per_page).offset((page - 1) * per_page)
      end

      def ordering_scope(scope, search_params)
        scope.order('started_at DESC')
      end

      def task_hash(task)
        return @tasks[task.id] if @tasks[task.id]
        task_hash       = Rabl.render(
            task, 'show',
            view_path: "#{ForemanTasks::Engine.root}/app/views/foreman_tasks/api/tasks",
            format:    :hash,
            scope:     self)
        @tasks[task.id] = task_hash
        return task_hash
      end

      private

      def action_permission
        case params[:action]
        when 'bulk_search'
          :view
        else
          super
        end
      end

      def find_task
        @task = Task.find_by_id(params[:id])
      end
    end
  end
end
