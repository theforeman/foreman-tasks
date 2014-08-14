class Setting::ForemanTasks < Setting

  def self.load_defaults
    # Check the table exists
    return unless super

    self.transaction do
      [
          self.set('dynflow_enable_console', N_("Enable the dynflow console (/foreman_tasks/dynflow) for debugging"), true),
          self.set('dynflow_console_require_auth', N_("Require user to be authenticated as user with admin rights when accessing dynflow console"), true)
      ].each { |s| self.create! s.update(:category => "Setting::ForemanTasks")}
    end

    true

  end

end
