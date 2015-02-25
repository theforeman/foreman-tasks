
#
# Copyright 2014 Red Hat, Inc.
#
# This software is licensed to you under the GNU General Public
# License as published by the Free Software Foundation; either version
# 2 of the License (GPLv2) or (at your option) any later version.
# There is NO WARRANTY for this software, express or implied,
# including the implied warranties of MERCHANTABILITY,
# NON-INFRINGEMENT, or FITNESS FOR A PARTICULAR PURPOSE. You should
# have received a copy of GPLv2 along with this software; if not, see
# http://www.gnu.org/licenses/old-licenses/gpl-2.0.txt.

module Actions
  module Middleware

    # Save the information about the current task id so that we can
    # add it as parent_task_id in child tasks.
    class SetCurrentTaskId < Dynflow::Middleware
      def plan(*args)
        set_current_task_id { pass(*args) }
      end

      def run(*args)
        set_current_task_id { pass(*args) }
      end

      def finalize
        set_current_task_id { pass }
      end

      private

      def set_current_task_id
        previous_task_id = Thread.current[:current_task_id]
        Thread.current[:current_task_id] = action.task.id
        yield
      ensure
        Thread.current[:current_task_id] = previous_task_id
      end

    end
  end
end
