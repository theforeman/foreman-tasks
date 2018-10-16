module ProxyAPI
  module ForemanDynflow
    class DynflowProxy
      PREFIX = 'dynflow'.freeze

      class Task < ProxyAPI::Resource
        def initialize(args)
          @url = "#{args[:url]}/#{PREFIX}/tasks"
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

      def features
        MultiJson.load(Task.new(@args).send(:get, 'features'))
      end

      def launch_tasks(feature, input, options = {})
        data = { :input => input,
                 :feature => feature,
                 :options => options }
        payload = MultiJson.dump(data)
        MultiJson.load(Task.new(@args).send(:post, payload, 'launch'))
      end
    end
  end
end
