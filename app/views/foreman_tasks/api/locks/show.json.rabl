object @lock

attributes :name, :resource_type, :resource_id
node(:exclusive) { !locals[:link] }
node(:link) do
  method = "#{@object.resource_type.underscore.split('/').first}_path".to_sym
  public_send(method, @object.resource_id) if defined?(method)
end
