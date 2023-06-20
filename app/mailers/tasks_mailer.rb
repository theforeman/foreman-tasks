class TasksMailer < ApplicationMailer
  helper ApplicationHelper

  def long_tasks(report, opts = {})
    return if report.tasks.empty?

    @report = report
    @subject = opts[:subject]
    @subject ||= _('Tasks pending since %s') % (@report.time - @report.interval)
    mail(to: report.user.mail, subject: @subject)
  end
end
