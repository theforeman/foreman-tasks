class AddMissingIndexes < ActiveRecord::Migration
  # since this is just making sure the indexes we defined before are
  # really added we don't define the down direction here.
  # The support for defining index at column definition was added in Rails here
  # https://github.com/rails/rails/commit/9a0d35e820464f872b0340366dded639f00e19b9
  # We need to fix migrations that happened before Rails 4.2
  def up
    add_index_unless_exists(:foreman_tasks_task_groups, :type)
    add_index_unless_exists(:foreman_tasks_tasks, :id)
    add_index_unless_exists(:foreman_tasks_tasks, :type)
    add_index_unless_exists(:foreman_tasks_tasks, :label)
    add_index_unless_exists(:foreman_tasks_tasks, :started_at)
    add_index_unless_exists(:foreman_tasks_tasks, :start_at)
    add_index_unless_exists(:foreman_tasks_tasks, :start_before)
    add_index_unless_exists(:foreman_tasks_tasks, :ended_at)
    add_index_unless_exists(:foreman_tasks_tasks, :state)
    add_index_unless_exists(:foreman_tasks_tasks, :result)
    add_index_unless_exists(:foreman_tasks_tasks, :external_id)
    add_index_unless_exists(:foreman_tasks_tasks, :parent_task_id)
    add_index_unless_exists(:foreman_tasks_locks, :task_id)
    add_index_unless_exists(:foreman_tasks_locks, :name)
    add_index_unless_exists(:foreman_tasks_locks, :exclusive)
  end

  def add_index_unless_exists(table, attribute)
    unless indexes(table).any? { |index| index.columns == [attribute.to_s] }
      add_index(table, attribute)
    end
  end
end
