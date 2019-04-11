module Support
  class DummyDynflowAction < Dynflow::Action
  end

  class DummyPauseAction < Actions::EntryAction
    def plan
      plan_action(DummyPauseActionWithCustomTroubleshooting)
      plan_self
    end

    def run
      error! "This is an error"
    end
  end

  class DummyPauseActionWithCustomTroubleshooting < Actions::EntryAction
    def run
      error! "This is an error"
    end

    def troubleshooting_info
      ForemanTasks::TroubleshootingHelpGenerator::Info.new.tap do |i|
        i.add_line _('This task requires special handling.')
        i.add_link(ForemanTasks::TroubleshootingHelpGenerator::Link.new(
                     name: :custom_link,
                     title: _('custom link'),
                     href: "/additional_troubleshooting_page",
                     description: _("Investigate %{link} on more details for this custom error.")
                   ))
      end
    end
  end
end
