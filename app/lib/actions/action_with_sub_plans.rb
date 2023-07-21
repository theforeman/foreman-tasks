module Actions
  class Actions::ActionWithSubPlans < Actions::EntryAction
    include Dynflow::Action::V2::WithSubPlans

    def plan(*_args)
      raise NotImplementedError
    end

    def humanized_output
      return unless counts_set?
      _('%{total} task(s), %{success} success, %{failed} fail') %
        { total:   total_count,
          success: output[:success_count],
          failed:  output[:failed_count] }
    end
  end
end
