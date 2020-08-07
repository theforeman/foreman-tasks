class RenameBookmarksController < ActiveRecord::Migration[5.2]
  def up
    original_controller = 'foreman_tasks_tasks'
    original_bookmarks = Bookmark.where(controller: original_controller)
    original_bookmarks_names = Hash[original_bookmarks.pluck(:name, :id)]

    new_controller = 'foreman_tasks/tasks'
    new_bookmarks = Bookmark.where(controller: new_controller)
    new_bookmarks.find_each do |new_bookmark|
      name = new_bookmark.name
      is_name_taken = original_bookmarks_names.key? name

      if is_name_taken
        original_bookmark = original_bookmarks.find(original_bookmarks_names[name])
        is_duplicated = original_bookmark.query == new_bookmark.query &&
                        original_bookmark.owner_id == new_bookmark.owner_id &&
                        original_bookmark.owner_type == new_bookmark.owner_type &&
                        original_bookmark.public == new_bookmark.public

        if is_duplicated
          original_bookmark.destroy
        else
          modified_name = "#{name}_#{generate_token}"
          original_bookmark.update(name: modified_name)
        end
      end
      # Revert to the original controller name
      new_bookmark.update(controller: original_controller)
    end
  end

  def generate_token
    SecureRandom.base64(5).gsub(/[^0-9a-z ]/i, '')
  end
end
