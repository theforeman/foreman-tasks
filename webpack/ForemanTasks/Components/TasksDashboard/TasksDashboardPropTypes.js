import PropTypes from 'prop-types';
import { TASKS_DASHBOARD_AVAILABLE_TIMES } from './TasksDashboardConstants';

export const timePropType = PropTypes.oneOf(
  Object.values(TASKS_DASHBOARD_AVAILABLE_TIMES)
);

export const queryPropType = PropTypes.shape({
  state: PropTypes.string,
  result: PropTypes.string,
  mode: PropTypes.string,
  time: timePropType,
});
