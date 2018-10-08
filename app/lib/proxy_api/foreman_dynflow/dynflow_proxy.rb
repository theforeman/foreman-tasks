module ProxyAPI
  module ForemanDynflow
    class DynflowProxy
      PREFIX = 'dynflow'.freeze

      class Task < ProxyAPI::Resource
        def initialize(args, suffix = nil)
          @url = "#{args[:url]}/#{PREFIX}/tasks"
          @url += "/#{suffix}" unless suffix.nil?
          super args
          @connect_params[:headers] ||= {}
          @connect_params[:headers]['content-type'] = 'application/json'
        end
      end

      def initialize(args)
        @args = args
      end

      # Initiate the command
      def trigger_task(action_name, action_input)
        payload = MultiJson.dump(:action_name => action_name, :action_input => action_input)
        MultiJson.load(Task.new(@args).send(:post, payload))
      end

      # Cancel the command
      def cancel_task(proxy_task_id)
        MultiJson.load(Task.new(@args).send(:post, '', "#{proxy_task_id}/cancel"))
      end

      def status_of_task(proxy_task_id)
        MultiJson.load(Task.new(@args).send(:get, "#{proxy_task_id}/status"))
      end

      def tasks_count(state)
        MultiJson.load(Task.new(@args).send(:get, "count?state=#{state}"))['count'].to_i
      end

      def task_states(ids)
        payload = MultiJson.dump(:task_ids => ids)
        MultiJson.load(Task.new(@args).send(:post, payload, 'status'))
      end

      def trigger_tasks(input_hash)
        payload = MultiJson.dump(input_hash)
        MultiJson.load(Task.new(@args, 'batch').send(:post, payload))
      end
    end
  end
end
