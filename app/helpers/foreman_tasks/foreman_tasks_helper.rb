module ForemanTasks
  # rubocop:disable Metrics/ModuleLength
  module ForemanTasksHelper
    def recurring_logic_state(recurring_logic)
      icon, status = case recurring_logic.state
                     when 'active'
                       'glyphicon-info-sign'
                     when 'disabled'
                       'glyphicon glyphicon-pause'
                     when 'finished'
                       ['glyphicon-ok-sign', 'status-ok']
                     when 'cancelled'
                       ['glyphicon-warning-sign', 'status-error']
                     else
                       'glyphicon-question-sign'
                     end
      content_tag(:i, '&nbsp'.html_safe, :class => "glyphicon #{icon}") + content_tag(:span, recurring_logic.humanized_state, :class => status)
    end

    def task_result_icon_class(task)
      return 'task-status pficon-help' if task.state != 'stopped'

      icon_class = case task.result
                   when 'success'
                     'pficon-ok'
                   when 'error'
                     'pficon-error-circle-o'
                   when 'warning'
                     'pficon-ok status-warn'
                   else
                     'pficon-help'
                   end

      "task-status #{icon_class}"
    end

    def time_in_words_span(time)
      if time.nil?
        _('N/A')
      else
        content_tag :span, (time > Time.now.utc ? _('in %s') : _('%s ago')) % time_ago_in_words(time),
                    :'data-original-title' => time.try(:in_time_zone), :rel => 'twipsy'
      end
    end

    def duration_in_words_span(start, finish)
      if start.nil?
        _('N/A')
      else
        content_tag :span, distance_of_time_in_words(start, finish),
                    :'data-original-title' => number_with_delimiter((finish - start).to_i) + _(' seconds'), :rel => 'twipsy'
      end
    end

    def recurring_logic_action_buttons(recurring_logic)
      buttons = []
      if authorized_for(:permission => :edit_recurring_logics, :auth_object => recurring_logic)
        buttons << link_to(N_('Enable'), enable_foreman_tasks_recurring_logic_path(recurring_logic), :method => :put, :class => '') if !recurring_logic.done? && recurring_logic.disabled?
        buttons << link_to(N_('Disable'), disable_foreman_tasks_recurring_logic_path(recurring_logic), :method => :put, :class => '') if !recurring_logic.done? && recurring_logic.enabled?
        buttons << link_to(N_('Cancel'), cancel_foreman_tasks_recurring_logic_path(recurring_logic), :method => :post, :class => '') unless recurring_logic.done?
      end
      action_buttons buttons
    end

    def recurring_logic_next_occurrence(recurring_logic)
      default = '-'
      return default if recurring_logic.done? || recurring_logic.disabled?

      last_task = recurring_logic.tasks.order(:start_at).last
      last_task ? last_task.start_at : default
    end

    def time_f(f, attr, field_options = {}, time_options = {}, html_options = {})
      f.fields_for attr do |fields|
        field(fields, attr, field_options) do
          fields.time_select attr, time_options, html_options
        end
      end
    end

    def date_f(f, attr, field_options = {}, date_options = {}, html_options = {})
      f.fields_for attr do |fields|
        field(fields, attr, field_options) do
          fields.date_select attr, date_options, html_options
        end
      end
    end

    def datetime_f(f, attr, field_options = {}, datetime_options = {}, html_options = {})
      f.fields_for attr do |fields|
        field(fields, attr, field_options) do
          [
            content_tag(:span, nil, :class => 'date', :style => 'white-space: nowrap;') do
              fields.date_select(attr, datetime_options, html_options)
            end,
            ' &mdash; ',
            content_tag(:span, nil, :class => 'time', :style => 'white-space: nowrap;') do
              fields.time_select(attr, datetime_options.merge(:ignore_date => true), html_options)
            end
          ].join
        end
      end
    end

    def inline_checkboxes_f(f, attr, field_options = {}, checkboxes = {}, options = {})
      field(f, attr, field_options) do
        checkboxes.map do |key, name|
          [f.check_box(key, options), " #{name} "]
        end.flatten.join('')
      end
    end

    def trigger_selector(f, triggering = Triggering.new, _options = {})
      render :partial => 'common/trigger_form', :locals => { :f => f, :triggering => triggering }
    end

    private

    def future_mode_fieldset(f, triggering)
      tags = []
      tags << text_f(f, :start_at_raw, :label => _('Start at'), :placeholder => 'YYYY-mm-dd HH:MM')
      tags << text_f(f, :start_before_raw, :label => _('Start before'), :placeholder => 'YYYY-mm-dd HH:MM',
                                           :label_help => _('Indicates that the action should be cancelled if it cannot be started before this time.'))
      content_tag(:fieldset, nil, :id => 'trigger_mode_future', :class => "trigger_mode_form #{'hidden' unless triggering.future?}") do
        tags.join.html_safe
      end
    end

    def recurring_mode_fieldset(f, triggering)
      tags = []
      tags << selectable_f(f, :input_type, %w[cronline monthly weekly daily hourly], {}, :label => _('Repeats'), :id => 'input_type_selector')
      tags += [
        cronline_fieldset(f, triggering),
        monthly_fieldset(f, triggering),
        weekly_fieldset(f, triggering),
        time_picker_fieldset(f, triggering)
      ]

      content_tag(:fieldset, nil, :id => 'trigger_mode_recurring', :class => "trigger_mode_form #{'hidden' unless triggering.recurring?}") do
        tags.join.html_safe
      end
    end

    def cronline_fieldset(f, triggering)
      options = [
        # TRANSLATORS: this translation is referring to an option which is a time interval
        _('is minute (range: 0-59)'),
        # TRANSLATORS: this translation is referring to an option which is a time interval
        _('is hour (range: 0-23)'),
        # TRANSLATORS: this translation is referring to an option which is a time interval
        _('is day of month (range: 1-31)'),
        # TRANSLATORS: this translation is referring to an option which is a time interval
        _('is month (range: 1-12)'),
        # TRANSLATORS: this translation is referring to an option which is a time interval
        _('is day of week (range: 0-6)')
      ].map { |opt| content_tag(:li, opt) }.join

      help = _("Cron line format 'a b c d e', where: %s") % "<br><ol type=\"a\">#{options}</ol>".html_safe
      content_tag(:fieldset, nil, :class => "input_type_form #{'hidden' unless triggering.input_type == :cronline}", :id => 'input_type_cronline') do
        text_f f, :cronline, :label => _('Cron line'), :placeholder => '* * * * *', :label_help => help
      end
    end

    def monthly_fieldset(f, triggering)
      content_tag(:fieldset, nil, :id => 'input_type_monthly', :class => "input_type_form #{'hidden' unless triggering.input_type == :monthly}") do
        text_f(f, :days, :label => _('Days'), :placeholder => '1,2...')
      end
    end

    def weekly_fieldset(f, triggering)
      content_tag(:fieldset, nil, :id => 'input_type_weekly', :class => "input_type_form #{'hidden' unless triggering.input_type == :weekly}") do
        f.fields_for :days_of_week do |days_of_week|
          inline_checkboxes_f(days_of_week,
                              :weekday,
                              { :label => _('Days of week') },
                              1 => _('Mon'),
                              2 => _('Tue'),
                              3 => _('Wed'),
                              4 => _('Thu'),
                              5 => _('Fri'),
                              6 => _('Sat'),
                              7 => _('Sun'))
        end
      end
    end

    def time_picker_fieldset(f, triggering)
      tags = []
      tags << content_tag(:fieldset, nil, :id => 'time_picker', :class => "input_type_form #{'hidden' if triggering.input_type == :cronline}") do
        # TRANSLATORS: Time widget for when a task should start
        time_f(f, :time, { :label => _('At'), :id => 'something' }, :time_separator => '')
      end
      tags << number_f(f, :max_iteration, :label => _('Repeat N times'), :min => 1, :placeholder => 'N')
      tags << field(f, :end_time_limit_select, :label => _('Ends'), :control_group_id => 'end_time_limit_select') do
        radio_button_f(f, :end_time_limited, :value => false, :checked => true, :text => _('Never'), :class => 'end_time_limit_selector') +
          # TRANSLATORS: Button text for saying when a task should end
          radio_button_f(f, :end_time_limited, :value => true, :text => _('On'), :class => 'end_time_limit_selector')
      end
      tags << content_tag(:fieldset, nil, :id => 'end_time_limit_form', :class => "input_type_form #{'hidden' unless triggering.end_time_limited}") do
        datetime_f f, :end_time, { :label => _('Ends at') }, :use_month_numbers => true, :use_two_digit_numbers => true, :time_separator => ''
      end
      tags.join.html_safe
    end
  end
  # rubocop:enable Metrics/ModuleLength
end
