import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'patternfly-react';
import classNames from 'classnames';
import { noop } from 'foremanReact/common/helpers';
import { translate as __ } from 'foremanReact/common/I18n';

import { TASKS_DASHBOARD_AVAILABLE_QUERY_STATES } from '../../../../TasksDashboardConstants';
import { queryPropType } from '../../../../TasksDashboardPropTypes';
import './ScheduledTasksCard.scss';

const ScheduledTasksCard = ({
  data,
  className,
  query,
  updateQuery,
  ...props
}) => {
  const { SCHEDULED } = TASKS_DASHBOARD_AVAILABLE_QUERY_STATES;
  const onClick = () => updateQuery({ state: SCHEDULED });

  return (
    <Card
      className={classNames(
        'tasks-donut-card',
        'scheduled-tasks-card',
        className,
        {
          'selected-tasks-card': query.state === SCHEDULED,
        }
      )}
      {...props}
      id="scheduled-tasks-card"
    >
      <Card.Title onClick={onClick}>{__('Scheduled')}</Card.Title>
      <Card.Body>
        <div
          className={classNames('scheduled-data', {
            'not-focused': query.state && query.state !== SCHEDULED,
          })}
          onClick={onClick}
        >
          {data}
          <p>{__('Total')}</p>
        </div>
      </Card.Body>
    </Card>
  );
};

ScheduledTasksCard.propTypes = {
  data: PropTypes.number,
  query: queryPropType,
  className: PropTypes.string,
  updateQuery: PropTypes.func,
};

ScheduledTasksCard.defaultProps = {
  data: 0,
  query: {},
  className: '',
  updateQuery: noop,
};

export default ScheduledTasksCard;
