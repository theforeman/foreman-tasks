#
# export_tasks.rake is a debugging tool to extract tasks from the
# current foreman instance.
#
# Run "foreman-rake foreman_tasks:export_tasks" to export tasks

require 'csv'

namespace :foreman_tasks do
  desc <<~DESC
    Export dynflow tasks based on filter. ENV variables:

      * TASK_SEARCH     : scoped search filter (example: 'label = "Actions::Foreman::Host::ImportFacts"')
      * TASK_FILE       : file to export to
      * TASK_FORMAT     : format to use for the export (either html or csv)
      * TASK_DAYS       : number of days to go back

    If TASK_SEARCH is not defined, it defaults to all tasks in the past 7 days and
    all unsuccessful tasks in the past 60 days. The default TASK_FORMAT is html
    which requires a tar.gz file extension.
  DESC
  task :export_tasks => [:environment, 'dynflow:client'] do
    deprecated_options = { :tasks => 'TASK_SEARCH',
                           :days => 'TASK_DAYS',
                           :export => 'TASK_FILE' }
    deprecated_options.each do |option, new_option|
      raise "The #{option} option is deprecated. Please use #{new_option} instead" if ENV.include?(option.to_s)
    end

    class TaskRender
      def initialize
        @cache = {}
      end

      def h(foo)
        foo
      end

      def url(foo)
        foo
      end

      def render_task(task)
        @plan = task.execution_plan
        erb('show')
      end

      def world
        ForemanTasks.dynflow.world
      end

      def template(filename)
        File.join(Gem::Specification.find_by_name('dynflow').gem_dir, 'web', 'views', "#{filename}.erb") # rubocop:disable Rails/DynamicFindBy
      end

      def erb(file, options = {})
        @cache[file] ||= Tilt.new(template(file))
        @cache[file].render(self, options[:locals])
      end

      def prettify_value(value)
        YAML.dump(value)
      end

      def prettyprint(value)
        value = prettyprint_references(value)
        if value
          pretty_value = prettify_value(value)
          <<-HTML
            <pre class="prettyprint lang-yaml">#{h(pretty_value)}</pre>
          HTML
        else
          ''
        end
      end

      def prettyprint_references(value)
        case value
        when Hash
          value.reduce({}) do |h, (key, val)|
            h.update(key => prettyprint_references(val))
          end
        when Array
          value.map { |val| prettyprint_references(val) }
        when Dynflow::ExecutionPlan::OutputReference
          value.inspect
        else
          value
        end
      end

      def duration_to_s(duration)
        h('%0.2fs' % duration)
      end

      def load_action(step)
        world.persistence.load_action_for_presentation(@plan, step.action_id, step)
      end

      def step_error(step)
        if step.error
          ['<pre>',
           "#{h(step.error.message)} (#{h(step.error.exception_class)})\n",
           h(step.error.backtrace.join("\n")),
           '</pre>'].join
        end
      end

      def show_world(world_id)
        if (registered_world = world.coordinator.find_worlds(false, id: world_id).first)
          '%{world_id} %{world_meta}' % { world_id: world_id, world_meta: registered_world.meta.inspect }
        else
          world_id
        end
      end

      def show_action_data(label, value)
        value_html = prettyprint(value)
        if !value_html.empty?
          <<-HTML
            <p>
              <b>#{h(label)}</b>
          #{value_html}
            </p>
          HTML
        else
          ''
        end
      end

      def atom_css_classes(atom)
        classes = ['atom']
        step    = @plan.steps[atom.step_id]
        case step.state
        when :success
          classes << 'success'
        when :error
          classes << 'error'
        when :skipped, :skipping
          classes << 'skipped'
        end
        classes.join(' ')
      end

      def flow_css_classes(flow, sub_flow = nil)
        classes = []
        case flow
        when Dynflow::Flows::Sequence
          classes << 'sequence'
        when Dynflow::Flows::Concurrence
          classes << 'concurrence'
        when Dynflow::Flows::Atom
          classes << atom_css_classes(flow)
        else
          raise "Unknown run plan #{run_plan.inspect}"
        end
        classes << atom_css_classes(sub_flow) if sub_flow.is_a? Dynflow::Flows::Atom
        classes.join(' ')
      end

      def step_css_class(step)
        case step.state
        when :success
          'success'
        when :error
          'important'
        end
      end

      def progress_width(step)
        if step.state == :error
          100 # we want to show the red bar in full width
        else
          step.progress_done * 100
        end
      end

      def step(step_id)
        @plan.steps[step_id]
      end

      def updated_url(new_params)
        url('?' + Rack::Utils.build_nested_query(params.merge(new_params.stringify_keys)))
      end
    end

    class PageHelper
      def self.pagify(io, template = nil)
        io.write <<~HTML
          <html>
            <head>
              <title>Dynflow Console</title>
              <script src="jquery.js"></script>
              <link rel="stylesheet" type="text/css" href="bootstrap.css">
              <link rel="stylesheet" type="text/css" href="application.css">
              <script src="bootstrap.js"></script>
              <script src="run_prettify.js"></script>
              <script src="application.js"></script>
            </head>
          <body>
        HTML
        if block_given?
          yield io
        else
          io.write template
        end
      ensure
        io.write '</body></html>'
      end

      def self.copy_assets(tmp_dir)
        ['vendor/bootstrap/js/bootstrap.js',
         'vendor/jquery/jquery.js',
         'vendor/jquery/jquery.js',
         'javascripts/application.js',
         'vendor/bootstrap/css/bootstrap.css',
         'stylesheets/application.css'].each do |file|
          filename = File.join(Gem::Specification.find_by_name('dynflow').gem_dir, 'web', 'assets', file) # rubocop:disable Rails/DynamicFindBy
          FileUtils.copy_file(filename, File.join(tmp_dir, File.basename(file)))
        end
      end

      def self.generate_with_index(io)
        io.write '<div><table class="table">'
        yield io
      ensure
        io.write '</table></div>'
      end

      def self.generate_index_entry(io, task)
        io << <<~EOF
          <tr>
            <td><a href=\"#{task.id}.html\">#{task.label}</a></td>
            <td>#{task.started_at}</td>
            <td>#{task.state}</td>
            <td>#{task.result}</td>
          </tr>
        EOF
      end
    end

    filter = if ENV['TASK_SEARCH'].nil? && ENV['TASK_DAYS'].nil?
               "started_at > \"#{7.days.ago.to_s(:db)}\" || " \
                 "(result != success && started_at > \"#{60.days.ago.to_s(:db)})\""
             else
               ENV['TASK_SEARCH'] || ''
             end

    if (days = ENV['TASK_DAYS'])
      filter += ' && ' unless filter == ''
      filter += "started_at > \"#{days.to_i.days.ago.to_s(:db)}\""
    end

    format = ENV['TASK_FORMAT'] || 'html'
    export_filename = ENV['TASK_FILE'] || "/tmp/task-export-#{Time.now.to_i}.#{format == 'csv' ? 'csv' : 'tar.gz'}"

    tasks = ForemanTasks::Task.search_for(filter).order(:started_at => :desc)

    puts _("Exporting all tasks matching filter #{filter}")
    puts _("Gathering #{tasks.count} tasks.")
    if format == 'html'
      Dir.mktmpdir('task-export') do |tmp_dir|
        PageHelper.copy_assets(tmp_dir)

        renderer = TaskRender.new
        total = tasks.count
        index = File.open(File.join(tmp_dir, 'index.html'), 'w')

        PageHelper.pagify(index) do |io|
          PageHelper.generate_with_index(io) do |index|
            tasks.find_each.each_with_index do |task, count|
              File.open(File.join(tmp_dir, "#{task.id}.html"), 'w') { |file| PageHelper.pagify(file, renderer.render_task(task)) }
              PageHelper.generate_index_entry(index, task)
              puts "#{count + 1}/#{total}"
            end
          end
        end
        index.close

        system("tar", "czf", export_filename, tmp_dir)
      end
    elsif format == 'csv'
      CSV.open(export_filename, 'wb') do |csv|
        csv << %w[id state type label result parent_task_id started_at ended_at]
        tasks.find_each do |task|
          csv << [task.id, task.state, task.type, task.label, task.result,
                  task.parent_task_id, task.started_at, task.ended_at]
        end
      end
    end

    puts "Created #{export_filename}"
  end
end
