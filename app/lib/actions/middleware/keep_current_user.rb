
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
    class KeepCurrentUser < Dynflow::Middleware
      def delay(*args)
        pass(*args).tap { store_current_user }
      end

      def plan(*args)
        with_current_user do
          pass(*args).tap { store_current_user }
        end
      end

      def run(*args)
        restore_curent_user { pass(*args) }
      end

      def finalize
        restore_curent_user { pass }
      end

      private

      def with_current_user
        if User.current || action.input[:current_user_id].nil?
          yield
        else
          restore_curent_user { yield }
        end
      end

      def store_current_user
        action.input[:current_user_id] = User.current.try(:id)
      end

      def restore_curent_user
        User.current = User.unscoped.find(action.input[:current_user_id])
        yield
      ensure
        User.current = nil
      end
    end
  end
end
