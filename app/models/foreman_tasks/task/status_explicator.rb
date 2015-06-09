module ForemanTasks
  class Task::StatusExplicator
    ANY = 1
    ERRONEOUS_STATUSES = [
      { :state => 'paused', :result => ANY },
      { :state => ANY, :result => 'error'},
      { :state => ANY, :result => 'warning'}
    ]
    def is_erroneous(task)
      remainder = ERRONEOUS_STATUSES.select do |status|
        (status[:state] == ANY || status[:state] == task.state) &&
          (status[:result] == ANY || status[:result] == task.result)
      end
      !remainder.empty?
    end
  end
end
