import React from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem } from 'patternfly-react';

import { TASKS_DASHBOARD_AVAILABLE_TIMES } from '../../../../TasksDashboardConstants';
import { getQueryValueText } from '../../../../TasksDashboardHelper';

const TimeDropDown = ({ id, className, selectedTime, onChange, ...props }) => {
  const availableTimes = Object.keys(TASKS_DASHBOARD_AVAILABLE_TIMES).map(
    key => ({
      key,
      text: getQueryValueText(key),
      active: key === selectedTime,
    })
  );

  return (
    <DropdownButton
      id={id}
      className={className}
      title={getQueryValueText(selectedTime)}
      {...props}
    >
      {availableTimes.map(({ key, text, active }) => (
        <MenuItem
          key={key}
          active={active}
          onClick={() => active || onChange(key)}
        >
          {text}
        </MenuItem>
      ))}
    </DropdownButton>
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
  onChange: () => null,
};

export default TimeDropDown;
