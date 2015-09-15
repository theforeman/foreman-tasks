function trigger_form_selector_binds(form_name, form_object_name) {
  var form = $('form#' +  form_name);
  var trigger_mode_selector = form.find('input.trigger_mode_selector');
  var input_type_selector = form.find('.form-control#input_type_selector');

  trigger_mode_selector.on('click', function () {
    ["future", "immediate", "recurring"].forEach(function(type) {
      form.find('fieldset.trigger_mode_form#trigger_mode_' + type).hide();
    });
    form.find('fieldset.trigger_mode_form#trigger_mode_' + $(this).val()).show();
  });

  input_type_selector.on('change', function () {
    var fieldset = form.find('fieldset.trigger_mode_form#trigger_mode_recurring');
    ['cronline', 'monthly', 'weekly', 'hourly', 'daily'].forEach(function(type) {
      fieldset.find('fieldset.input_type_form#input_type_' + type).hide();
    })
    fieldset.find('fieldset.input_type_form#input_type_' + $(this).val()).show();
    var timepicker = fieldset.find('fieldset.input_type_form#time_picker');
    if($(this).val() == 'cronline') {
      timepicker.hide();
    } else {
      var hour_picker = timepicker.find('#s2id_triggering_time_time_4i');
      if($(this).val() == 'hourly') {
        hour_picker.hide();
      } else {
        hour_picker.show();
      }
      timepicker.show();
    }
  });

  form.find('input.end_time_limit_selector').on('click', function() {
    var o = form.find('fieldset#trigger_mode_recurring fieldset#end_time_limit_form');
    if($(this).val() === 'true') {
      o.show();
    } else {
      o.hide();
    };
  });
};
