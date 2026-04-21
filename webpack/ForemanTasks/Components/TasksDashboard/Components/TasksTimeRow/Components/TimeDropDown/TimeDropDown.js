import React from 'react';
import PropTypes from 'prop-types';
import { SimpleDropdown } from '@patternfly/react-templates';
import { noop } from 'foremanReact/common/helpers';

import { TASKS_DASHBOARD_AVAILABLE_TIMES } from '../../../../TasksDashboardConstants';
import { getQueryValueText } from '../../../../TasksDashboardHelper';

const TimeDropDown = ({ id, className, selectedTime, onChange, ...props }) => {
  const availableTimes = Object.keys(TASKS_DASHBOARD_AVAILABLE_TIMES).map(
    key => ({
      value: key,
      content: getQueryValueText(key),
      onClick: () => key === selectedTime || onChange(key),
    })
  );

  return (
    <SimpleDropdown
      id={id}
      className={className}
      toggleVariant="plainText"
      toggleContent={getQueryValueText(selectedTime)}
      initialItems={availableTimes}
      {...props}
    />
  );
};

TimeDropDown.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  selectedTime: PropTypes.oneOf(Object.keys(TASKS_DASHBOARD_AVAILABLE_TIMES)),
  onChange: PropTypes.func,
};

TimeDropDown.defaultProps = {
  className: '',
  selectedTime: TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
  onChange: noop,
};

export default TimeDropDown;
