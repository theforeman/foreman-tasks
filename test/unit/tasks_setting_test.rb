require 'foreman_tasks_test_helper'

class TasksSettingTest < ActiveSupport::TestCase
  describe "foreman_tasks_troubleshooting_url" do
    test "invalid url for foreman_tasks_troubleshooting_url are rejected" do
      url_setting = Setting.new(name: 'foreman_tasks_troubleshooting_url', value: 'invalid url')
      url_setting.valid?
    rescue => e
      assert_includes e.message, "Invalid URL"
    end

    test "valid foreman_tasks_troubleshooting_url values are accepted" do
      url_setting = Setting.new(name: 'foreman_tasks_troubleshooting_url', value: 'https://example.com')
      assert url_setting.valid?
    end

    test "valid foreman_tasks_troubleshooting_url values with placeholder are accepted" do
      url_setting = Setting.new(name: 'foreman_tasks_troubleshooting_url', value: 'https://example/%{label}/%{version}.com')
      assert url_setting.valid?
    end
  end
end
