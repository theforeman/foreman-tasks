require 'powerbar'
module ForemanTasks
  module Hammer
    class TaskProgress
      attr_accessor :interval, :task

      def initialize(task_id, &block)
        @update_block = block
        @task_id      = task_id
        @interval     = 2
      end

      def render
        update_task
        if task_pending?
          render_progress
        else
          render_result
        end
      end

      private

      def render_progress
        progress_bar do |bar|
          begin
            while true
              bar.show(:msg => "Task #{@task_id} progress", :done => @task['progress'].to_f, :total => 1)
              if task_pending?
                sleep interval
                update_task
              else
                break
              end
            end
          rescue Interrupt
            # Inerrupting just means we stop rednering the progress bar
          end
        end
      end

      def render_result
        puts "Task %{uuid}: %{result}" % { :uuid => @task_id, :result => @task['result'] }
        unless @task['humanized']['output'].to_s.empty?
          puts @task['humanized']['output']
        end
      end

      def update_task
        @task = @update_block.call(@task_id)
      end

      def task_pending?
        !%w[paused stopped].include?(@task['state'])
      end

      def progress_bar
        bar                                      = PowerBar.new
        @closed = false
        bar.settings.tty.finite.template.main    = '[${<bar>}] [${<percent>%}]'
        bar.settings.tty.finite.template.padchar = ' '
        bar.settings.tty.finite.template.barchar = '.'
        bar.settings.tty.finite.output           = Proc.new { |s| $stderr.print s }
        yield bar
      ensure
        bar.close
        render_result
      end
    end
  end
end
