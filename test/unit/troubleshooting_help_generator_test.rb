require 'foreman_tasks_test_helper'
require 'foreman_tasks/test_helpers'

module ForemanTasks
  class TroubleshootingHelpGeneratorTest < ActiveSupport::TestCase
    include ForemanTasks::TestHelpers::WithInThreadExecutor

    subject do
      TroubleshootingHelpGenerator.new(@task.main_action)
    end

    let :sample_troubleshooting_url do
      'https://theforeman.org/manuals/%{version}/tasks_troubleshooting.html#%{label}'
    end

    let :expected_troubleshooting_url do
      "https://theforeman.org/manuals/#{SETTINGS[:version].short}/tasks_troubleshooting.html#Support::DummyPauseAction"
    end

    let :action_class do
      Support::DummyPauseAction
    end

    before do
      Setting::ForemanTasks.load_defaults
      ::ForemanTasks::Task.delete_all
      @task = trigger_task
      Setting[:foreman_tasks_troubleshooting_url] = sample_troubleshooting_url
    end

    it 'generates html from the main action troubleshooting_info' do
      generated_html = subject.generate_html
      generated_html.must_include "A paused task represents a process that has not finished properly"
      generated_html.must_include %(See <a href="#{expected_troubleshooting_url}">troubleshooting documentation</a> for more details on how to resolve the issue)
    end

    it 'exposes link details' do
      link = subject.links.find do |l|
        l.name == :troubleshooting && l.title == 'troubleshooting documentation' &&
          l.href == expected_troubleshooting_url
      end
      assert link, "#{subject.links} doesn't contain expected link"
    end

    describe 'additional troubleshooting info' do
      let(:action_class) do
        Support::DummyPauseActionWithCustomTroubleshooting
      end

      it 'includes additional description in generated html' do
        generated_html = subject.generate_html
        generated_html.must_include 'A paused task represents a process that has not finished properly'
        generated_html.must_match %r{See <a href=".*">troubleshooting documentation</a> for more details on how to resolve the issue}
        generated_html.must_include 'This task requires special handling'
        generated_html.must_include 'Investigate <a href="/additional_troubleshooting_page">custom link</a> on more details for this custom error'
      end

      it 'includes additional links' do
        link = subject.links.find do |l|
          l.name == :custom_link && l.title == 'custom link' && l.href == '/additional_troubleshooting_page'
        end
        assert link, "#{subject.links} doesn't contain expected link"
      end
    end

    def trigger_task
      t = ForemanTasks.trigger(action_class)
      t.finished.wait
      ForemanTasks::Task.find_by(external_id: t.execution_plan_id)
    end
  end
end
