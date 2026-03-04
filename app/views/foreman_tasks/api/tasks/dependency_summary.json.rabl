attributes :id, :action, :state, :result
node(:humanized) { |task| task.to_label }
