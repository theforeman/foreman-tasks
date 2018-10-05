module Actions
  class Actions::ActionWithSubPlans < Actions::EntryAction
    include Dynflow::Action::WithSubPlans

    def plan(*_args)
      raise NotImplementedError
    end

    def humanized_output
      return unless counts_set?
      _('%{total} task(s), %{success} success, %{failed} fail') %
        { total:   output[:total_count],
          success: output[:success_count],
          failed:  output[:failed_count] }
    end

    def run_progress
      if counts_set? && output[:total_count] > 0
        (output[:success_count] + output[:failed_count]).to_f / output[:total_count]
      else
        0.1
      end
    end
  end
end
