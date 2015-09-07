Bookmark.without_auditing do
  [
    { :name => "running", :query => "state = running" },
    { :name => "failed", :query => "state = paused or result = error or result = warning" }

  ].each do |item|
    next if Bookmark.find_by_name(item[:name])
    next if audit_modified? Bookmark, item[:name]
    b = Bookmark.create({:controller => "foreman_tasks_tasks", :public => true}.merge(item))
    raise "Unable to create bookmark: #{format_errors b}" if b.nil? || b.errors.any?
  end
end
