f = Feature.find_or_create_by(:name => 'Dynflow')
raise "Unable to create proxy feature: #{format_errors f}" if f.nil? || f.errors.any?
