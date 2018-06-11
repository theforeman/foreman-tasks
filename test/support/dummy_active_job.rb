module Support
  class DummyActiveJob < ApplicationJob
    def humanized_name
      "Dummy action"
    end
  end
end
