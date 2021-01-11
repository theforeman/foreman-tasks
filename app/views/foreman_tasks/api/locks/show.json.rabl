object @lock

attributes :name, :resource_type, :resource_id
node(:exclusive) { !locals[:link] }
