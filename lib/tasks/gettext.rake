gettext_find_task = begin
                      Rake::Task['gettext:find']
                    rescue
                      nil
                    end

if gettext_find_task
  namespace :gettext do
    task :store_action_names => :environment do
      storage_file = "#{locale_path}/action_names.rb"
      puts "writing action translations to: #{storage_file}"

      klasses = Actions::EntryAction
                .subclasses
                .uniq
                .select do |action|
        src, = Object.const_source_location(action.to_s)
        src.start_with? @engine.root.to_s
      end

      File.write storage_file,
                 "# Autogenerated!\n" +
                 klasses
                 .map { |klass| %[_("#{klass.allocate.humanized_name}")] }
                 .sort
                 .join("\n") + "\n"
    end
  end

  gettext_find_task.enhance ['gettext:store_action_names']
end
