module ForemanTasksCore
  class BatchCallback < ::Dynflow::Action
    def plan(input_hash, results)
      plan_self :targets => input_hash, :results => results
    end

    def run
      payload = format_payload(input['targets'], input['results'])
      SmartProxyDynflowCore::Callback::Request.new.callback({ :callbacks => payload }.to_json)
    end

    private

    def format_payload(input_hash, results)
      input_hash.map do |task_id, callback|
        { :callback => callback, :data => results[task_id] }
      end
    end
  end
end
