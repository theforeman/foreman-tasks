import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'patternfly-react';
import classNames from 'classnames';
import { noop } from 'foremanReact/common/helpers';
import { translate as __ } from 'foremanReact/common/I18n';

import { StoppedTable } from './StoppedTasksCardHelper';
import {
  timePropType,
  queryPropType,
} from '../../../../TasksDashboardPropTypes';
import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
} from '../../../../TasksDashboardConstants';
import { getQueryValueText } from '../../../../TasksDashboardHelper';
import './StoppedTasksCard.scss';

const StoppedTasksCard = ({
  data,
  query,
  time,
  className,
  updateQuery,
  ...props
}) => {
  const { STOPPED } = TASKS_DASHBOARD_AVAILABLE_QUERY_STATES;
  return (
    <Card
      className={classNames(
        'tasks-donut-card',
        'stopped-tasks-card',
        className,
        {
          'selected-tasks-card': query.state === STOPPED,
        }
      )}
      {...props}
      id="stopped-tasks-card"
    >
      <Card.Title onClick={() => updateQuery({ state: STOPPED })}>
        {__('Stopped')}
      </Card.Title>
      <Card.Body>
        <table className="table table-bordered table-striped stopped-table">
          <thead>
            <tr>
              <th />
              <th>{__('Total')}</th>
              <th>{getQueryValueText(time)}</th>
            </tr>
          </thead>
          <tbody>{StoppedTable(data, query, time, updateQuery)}</tbody>
        </table>
      </Card.Body>
    </Card>
  );
};

const resultPropType = PropTypes.shape({
  total: PropTypes.number.isRequired,
  last: PropTypes.number.isRequired,
});

StoppedTasksCard.propTypes = {
  data: PropTypes.shape({
    error: resultPropType.isRequired,
    warning: resultPropType.isRequired,
    success: resultPropType.isRequired,
  }),
  time: timePropType,
  query: queryPropType,
  className: PropTypes.string,
  updateQuery: PropTypes.func,
};

StoppedTasksCard.defaultProps = {
  data: {
    error: { total: 0, last: 0 },
    warning: { total: 0, last: 0 },
    success: { total: 0, last: 0 },
  },
  time: TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
  query: {},
  className: '',
  updateQuery: noop,
};

export default StoppedTasksCard;
