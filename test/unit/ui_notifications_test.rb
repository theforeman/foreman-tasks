require 'foreman_tasks_test_helper'

module ForemanTasks
  class UiNotificationsTest < ActiveSupport::TestCase
    include ForemanTasks::TestHelpers::WithInThreadExecutor

    let(:admin_user) { @admin_user }
    let(:task_owner) { FactoryBot.create(:user) }

    let :sample_troubleshooting_url do
      'https://theforeman.org/manuals/%{version}/tasks_troubleshooting.html#%{label}'
    end

    before do
      ::ForemanTasks::Task.delete_all
      load File.join(ForemanTasks::Engine.root, 'db', 'seeds.d', '30-notification_blueprints.rb')
      @admin_user = FactoryBot.create(:user, :admin)
      Setting[:foreman_tasks_troubleshooting_url] = sample_troubleshooting_url
    end

    describe UINotifications::Tasks::TaskPausedAdmin do
      it 'notifies all admins about current amount of paused tasks when some paused task occurs' do
        trigger_task
        notification = user_notifications(admin_user).first
        assert_equal "There is 1 paused task in the system that need attention", notification.message
        links = notification.actions['links']
        assert_includes(links, { 'href' => '/foreman_tasks/tasks?search=state%3Dpaused',
                                'title' => 'List of tasks' })
        assert_includes(links, { 'name' => 'troubleshooting',
                                'title' => 'Troubleshooting Documentation',
                                'description' => 'See %{link} for more details on how to resolve the issue',
                                'href' => "https://theforeman.org/manuals/#{SETTINGS[:version].short}/tasks_troubleshooting.html#",
                                'external' => true })
      end

      it 'aggregates the notification when multiple tasks get paused' do
        trigger_task
        recipient1 = NotificationRecipient.find_by(user_id: admin_user)
        assert_match(/1 paused task/, recipient1.notification.message)

        new_admin_user = FactoryBot.create(:user, :admin)

        trigger_task

        assert_nil NotificationRecipient.find_by(id: recipient1.id)
        assert_nil Notification.find_by(id: recipient1.notification.id)
        recipient2 = NotificationRecipient.find_by(user_id: admin_user)
        assert_match(/2 paused tasks/, recipient2.notification.message)

        new_recipient = NotificationRecipient.find_by(user_id: new_admin_user)
        assert_equal recipient2.notification, new_recipient.notification
      end
    end

    describe UINotifications::Tasks::TaskPausedOwner do
      it 'notifies the owner about the paused task' do
        task = trigger_task
        notifications = user_notifications(task_owner)
        assert_equal 1, notifications.size, 'Only notification for the main action should be triggered'
        notification = notifications.first
        assert_equal "The task 'Dummy pause action' got paused", notification.message
        links = notification.actions['links']
        assert_includes(links, "href" => "/foreman_tasks/tasks/#{task.id}", "title" => "Task Details")
        assert_includes(links, 'name' => 'troubleshooting',
                        'title' => 'Troubleshooting Documentation',
                        'description' => 'See %{link} for more details on how to resolve the issue',
                        'href' => "https://theforeman.org/manuals/#{SETTINGS[:version].short}/tasks_troubleshooting.html#Support::DummyPauseAction",
                        'external' => true)
      end
    end

    def trigger_task
      as_user task_owner do
        t = ForemanTasks.trigger(::Support::DummyPauseAction)
        t.finished.wait
        ForemanTasks::Task.find_by(external_id: t.execution_plan_id)
      end
    end

    def user_notifications(user)
      Notification.joins(:notification_recipients).where('notification_recipients.user_id' => user.id)
    end
  end
end
