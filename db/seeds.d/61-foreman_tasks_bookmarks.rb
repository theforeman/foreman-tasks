Bookmark.without_auditing do
  [
    { :name => 'running', :query => 'state = running' },
    { :name => 'failed', :query => 'state = paused or result = error or result = warning' }

  ].each do |item|
    next if Bookmark.where(:name => item[:name]).first
    next if SeedHelper.audit_modified? Bookmark, item[:name]
    b = Bookmark.create({ :controller => 'foreman_tasks_tasks', :public => true }.merge(item))
    raise "Unable to create bookmark: #{format_errors b}" if b.nil? || b.errors.any?
  end
end
