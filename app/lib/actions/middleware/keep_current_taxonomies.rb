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
    class KeepCurrentTaxonomies < Dynflow::Middleware
      def delay(*args)
        pass(*args).tap { store_current_taxonomies }
      end

      def plan(*args)
        with_current_taxonomies do
          pass(*args).tap { store_current_taxonomies }
        end
      end

      def run(*args)
        restore_current_taxonomies { pass(*args) }
      end

      def finalize
        restore_current_taxonomies { pass }
      end

      private

      def with_current_taxonomies
        if has_current_taxonomies?
          yield
        else
          restore_current_taxonomies { yield }
        end
      end

      def store_current_taxonomies
        action.input[:current_organization_id] = Organization.current.try(:id)
        action.input[:current_location_id] = Location.current.try(:id)
      end

      def restore_current_taxonomies
        Organization.current = Organization.unscoped.find(action.input[:current_organization_id]) if action.input[:current_organization_id].present?
        Location.current = Location.unscoped.find(action.input[:current_location_id]) if action.input[:current_location_id].present?
        yield
      ensure
        Organization.current = nil
        Location.current = nil
      end

      def has_current_taxonomies?
        (Organization.current || action.input[:current_organization_id].nil?) &&
        (Location.current || action.input[:current_location_id].nil?)
      end
    end
  end
end
