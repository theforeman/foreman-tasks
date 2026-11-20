require 'foreman_tasks_test_helper'

module Actions
  class LongRunningTasksNotificationTest < ActiveSupport::TestCase
    include ::Dynflow::Testing

    def setup
      @notification = ForemanTasks::TasksMailNotification.find_or_create_by!(:name => 'long_running_tasks') do |mail|
        mail.description = 'A notification when tasks run for suspiciously long time'
        mail.mailer = 'TasksMailer'
        mail.mailer_method = 'long_tasks'
        mail.subscription_type = 'alert'
      end
    end

    def subscribe(user)
      UserMailNotification.create!(:user => user, :mail_notification => @notification, :interval => 'Subscribe')
    end

    def report_for(user, task)
      OpenStruct.new(
        :user_id => user.id,
        :time => Time.now.utc,
        :interval => 2.days,
        :states => ['running'],
        :task_uuids => [task.id],
        :query => 'state = running',
        :user => nil,
        :tasks => nil
      )
    end

    def deliver(user)
      task = FactoryBot.create(:some_task)
      action = create_and_plan_action(DeliverLongRunningTasksNotification, report_for(user, task))
      ::UINotifications::Tasks::TasksRunningLong.any_instance.expects(:deliver!).once
      run_action(action)
    end

    test 'notification recipients skip users who cannot receive mail' do
      enabled = FactoryBot.create(:user, :with_mail, :mail_enabled => true)
      mail_disabled = FactoryBot.create(:user, :with_mail, :mail_enabled => false)
      account_disabled = FactoryBot.create(:user, :with_mail, :mail_enabled => true, :disabled => true)
      subscribe(enabled)
      subscribe(mail_disabled)
      subscribe(account_disabled)

      recipient_ids = CheckLongRunningTasks.notification_recipients.pluck(:id)

      assert_includes recipient_ids, enabled.id
      refute_includes recipient_ids, mail_disabled.id
      refute_includes recipient_ids, account_disabled.id
    end

    test 'delivery skips the email when mail is disabled' do
      user = FactoryBot.create(:user, :with_mail, :mail_enabled => false)
      TasksMailer.expects(:long_tasks).never
      deliver(user)
    end

    test 'delivery skips the email when the account is disabled' do
      user = FactoryBot.create(:user, :with_mail, :mail_enabled => true, :disabled => true)
      TasksMailer.expects(:long_tasks).never
      deliver(user)
    end

    test 'delivery sends the email when the user can receive mail' do
      user = FactoryBot.create(:user, :with_mail, :mail_enabled => true)
      message = mock('message')
      message.expects(:deliver_now).once
      TasksMailer.expects(:long_tasks).once.returns(message)
      deliver(user)
    end
  end
end
