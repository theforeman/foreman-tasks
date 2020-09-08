class RemoveTaxonomyFromTaskFilters < ActiveRecord::Migration[6.0]
  def up
    Permission.where(name: %w[view_foreman_tasks edit_foreman_tasks]).each do |perm|
      TaxableTaxonomy.where(taxable_type: 'Filter', taxable_id: perm.filter_ids).delete_all
      perm.filters.update_all(taxonomy_search: nil)
    end
  end
end
