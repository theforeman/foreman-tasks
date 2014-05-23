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
    class ViewersController < ::Api::V2::BaseController

      resource_description do
        resource_id 'foreman_tasks_viewer'
        api_version 'v2'
        api_base_url "/foreman_tasks/api"
      end

      # Foreman right now doesn't have mechanism to
      # cause general BadRequest handling, resuing the Apipie::ParamError
      # for now http://projects.theforeman.org/issues/3957
      class BadRequest < Apipie::ParamError
      end

      api :GET, "/viewer", "Get status of the viewer"
      def show
        render json: viewer_hash
      end

      api :DELETE, "/viewer", "Turn off the viewer"
      def destroy
        ForemanTasks.viewer.shutdown!
        render json: viewer_hash
      end

      def viewer_hash
        viewer = ForemanTasks.viewer
        {
          :viewer =>
          {
            :required => viewer.required?,
            :initialized => viewer.initialized?,
            :plan_count => viewer.initialized? ? viewer_plan_count : 0
          }
        }
      end

      def viewer_plan_count
        ForemanTasks.viewer.world.persistence.find_execution_plans({}).count
      end
    end
  end
end
