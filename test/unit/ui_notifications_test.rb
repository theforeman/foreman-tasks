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
      Setting::ForemanTasks.load_defaults
      ::ForemanTasks::Task.delete_all
      load File.join(ForemanTasks::Engine.root, 'db', 'seeds.d', '30-notification_blueprints.rb')
      @admin_user = FactoryBot.create(:user, :admin)
      Setting[:foreman_tasks_troubleshooting_url] = sample_troubleshooting_url
    end

    describe UINotifications::Tasks::TaskPausedAdmin do
      it 'notifies all admins about current amount of paused tasks when some paused task occurs' do
        trigger_task
        notification = user_notifications(admin_user).first
        notification.message.must_equal "There is 1 paused task in the system that need attention"
        links = notification.actions['links']
        links.must_include('href' => '/foreman_tasks/tasks?search=state%3Dpaused',
                           'title' => 'List of tasks')
        links.must_include('name' => 'troubleshooting',
                           'title' => 'Troubleshooting Documentation',
                           'description' => 'See %{link} for more details on how to resolve the issue',
                           'href' => "https://theforeman.org/manuals/#{SETTINGS[:version].short}/tasks_troubleshooting.html#",
                           'external' => true)
      end

      it 'aggregates the notification when multiple tasks get paused' do
        trigger_task
        recipient1 = NotificationRecipient.find_by(user_id: admin_user)
        recipient1.notification.message.must_match(/1 paused task/)

        new_admin_user = FactoryBot.create(:user, :admin)

        trigger_task

        NotificationRecipient.find_by(id: recipient1.id).must_be_nil
        Notification.find_by(id: recipient1.notification.id).must_be_nil
        recipient2 = NotificationRecipient.find_by(user_id: admin_user)
        recipient2.notification.message.must_match(/2 paused tasks/)

        new_recipient = NotificationRecipient.find_by(user_id: new_admin_user)
        new_recipient.notification.must_equal recipient2.notification
      end
    end

    describe UINotifications::Tasks::TaskPausedOwner do
      it 'notifies the owner about the paused task' do
        task = trigger_task
        notifications = user_notifications(task_owner)
        assert_equal 1, notifications.size, 'Only notification for the main action should be triggered'
        notification = notifications.first
        notification.message.must_equal "The task 'Dummy pause action' got paused"
        links = notification.actions['links']
        links.must_include("href" => "/foreman_tasks/tasks/#{task.id}",
                           "title" => "Task Details")
        links.must_include('name' => 'troubleshooting',
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
