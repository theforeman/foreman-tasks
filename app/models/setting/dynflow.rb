class Setting::ForemanTasks < Setting

  def self.load_defaults
    # Check the table exists
    return unless super

    self.transaction do
      [
          self.set('dynflow_enable_console', N_("Enable the dynflow console (/foreman_tasks/dynflow) for debugging"), false),
      ].each { |s| self.create! s.update(:category => "Setting::ForemanTasks")}
    end

    true

  end

end
