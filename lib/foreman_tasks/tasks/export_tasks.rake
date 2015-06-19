#
# export_tasks.rake is a debugging tool to extract tasks from the
# current foreman instance.
#
# Run "foreman-rake export_tasks" to export tasks whcih are not listed
# as successful.
# To export all tasks "foreman-rake export_tasks tasks=all"
#   to specify the number of days of tasks to gather:  days=60 (defaults to 60)

namespace :foreman_tasks do
  desc 'Export Dynflow Tasks'

  task :export_tasks => :environment do

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
        erb('show', {})
      end

      def world
        ForemanTasks.dynflow.world
      end

      def template(filename)
        File.join(Gem::Specification.find_by_name("dynflow").gem_dir, 'web', 'views', "#{filename}.erb")
      end

      def erb(file, options)
        unless @cache[file]
          @cache[file] = Tilt.new(template(file))
        end
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
          ""
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
        h("%0.2fs" % duration)
      end

      def load_action(step)
        world.persistence.load_action(step)
      end

      def step_error(step)
        if step.error
          ['<pre>',
           "#{h(step.error.message)} (#{h(step.error.exception_class)})\n",
           h(step.error.backtrace.join("\n")),
           '</pre>'].join
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
          ""
        end
      end

      def atom_css_classes(atom)
        classes = ["atom"]
        step    = @plan.steps[atom.step_id]
        case step.state
        when :success
          classes << "success"
        when :error
          classes << "error"
        when :skipped, :skipping
          classes << "skipped"
        end
        return classes.join(" ")
      end

      def flow_css_classes(flow, sub_flow = nil)
        classes = []
        case flow
        when Dynflow::Flows::Sequence
          classes << "sequence"
        when Dynflow::Flows::Concurrence
          classes << "concurrence"
        when Dynflow::Flows::Atom
          classes << atom_css_classes(flow)
        else
          raise "Unknown run plan #{run_plan.inspect}"
        end
        classes << atom_css_classes(sub_flow) if sub_flow.is_a? Dynflow::Flows::Atom
        return classes.join(" ")
      end

      def step_css_class(step)
        case step.state
        when :success
          "success"
        when :error
          "important"
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
        url("?" + Rack::Utils.build_nested_query(params.merge(new_params.stringify_keys)))
      end


    end

    class PageHelper
      def self.pagify(template)
       pre =  <<-HTML
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
          #{template}
       <body>
       </html>
         HTML
       end

       def self.copy_assets(tmp_dir)
           ['vendor/bootstrap/js/bootstrap.js',
            'vendor/google-code-prettify/run_prettify.js',
            'vendor/jquery/jquery.js',
            'vendor/jquery/jquery.js',
            'javascripts/application.js',
            'vendor/bootstrap/css/bootstrap.css',
            'stylesheets/application.css'].each do |file|

             filename = File.join(Gem::Specification.find_by_name("dynflow").gem_dir, 'web', 'assets', file)
             FileUtils.copy_file(filename, File.join(tmp_dir, File.basename(file)))
           end
       end

      def self.generate_index(tasks)
        html = "<div><table class=\"table\">"
        tasks.order("started_at desc").all.each do |task|
          html << "<tr><td><a href=\"#{task.id}.html\">#{task.label}</a></td><td>#{task.started_at}</td>\
                   <td>#{task.state}</td><td>#{task.result}</td></tr>"
        end
        html << "</table></div>"
      end
    end


    if ENV['tasks'] == 'all'
      tasks = ForemanTasks::Task
    else
      tasks = ForemanTasks::Task.where("result != 'success'")
    end

    days = ENV['days'].try(:to_i) || 60
    tasks = tasks.where('started_at > ?', days.days.ago)
    export_filename = ENV['export'] || "/tmp/task-export-#{DateTime.now.to_i}.tar.gz"

    puts _("Gathering last #{days} days of tasks.")
    Dir.mktmpdir('task-export') do |tmp_dir|
      PageHelper.copy_assets(tmp_dir)


      renderer = TaskRender.new
      count = 1
      total = tasks.count

      tasks.all.each do |task|
        File.open(File.join(tmp_dir, "#{task.id}.html"), 'w') {|file| file.write(PageHelper.pagify(renderer.render_task(task)))}
        puts "#{count}/#{total}"
        count += 1
      end

      File.open(File.join(tmp_dir, "index.html"), 'w') {|file| file.write(PageHelper.pagify(PageHelper.generate_index(tasks)))}

      sh("tar cvzf #{export_filename} #{tmp_dir} > /dev/null")
    end

    puts "Created #{export_filename}"

  end
end
