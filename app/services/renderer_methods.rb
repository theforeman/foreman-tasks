# frozen_string_literal: true

# macros to fetch information about invoked jobs
module RendererMethods
  extend ActiveSupport::Concern

  def find_job_invocation_by_id(job_id, preload: nil)
    JobInvocation.preload(preload).find_by(id: job_id)
  rescue ActiveRecord::NotFound => _e
    raise ::Foreman::Exception.new(N_("Can't find Job Invocation for an id %s"), job_id)
  end
end
