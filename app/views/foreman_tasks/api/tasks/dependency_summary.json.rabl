object @task

attributes :id, :action, :state, :result
node(:humanized) { @task.humanized[:action] }
