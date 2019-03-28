import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';

import { timePropType } from '../../TasksDashboardPropTypes';
import { TASKS_DASHBOARD_AVAILABLE_TIMES } from '../../TasksDashboardConstants';
import TimeDropDown from './Components/TimeDropDown/TimeDropDown';
import './TasksTimeRow.scss';

const TasksTimeRow = ({ time, updateTime }) => (
  <Row className="tasks-time-row">
    <span className="time-label">{__('With focus on last')}</span>
    <TimeDropDown
      id="tasks-dashboard-time-period-dropdown"
      selectedTime={time}
      onChange={updateTime}
    />
  </Row>
);

TasksTimeRow.propTypes = {
  time: timePropType,
  updateTime: PropTypes.func,
};

TasksTimeRow.defaultProps = {
  time: TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
  updateTime: () => null,
};

export default TasksTimeRow;
