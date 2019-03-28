import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card } from 'patternfly-react';

import {
  TASKS_DASHBOARD_AVAILABLE_QUERY_MODES,
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_CURRENT_TIME,
} from '../../../../TasksDashboardConstants';
import { getTimeText } from '../../../../TasksDashboardHelper';
import {
  timePropType,
  queryPropType,
} from '../../../../TasksDashboardPropTypes';
import { TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS } from '../TasksDonutChart/TasksDonutChartConstants';
import { getFocusedOn } from '../TasksDonutChart/TasksDonutChartHelper';
import TasksDonutChart from '../TasksDonutChart/TasksDonutChart';
import './TasksDonutCard.scss';

const TasksDonutCard = ({
  title,
  data,
  query,
  wantedQueryState,
  className,
  time,
  updateQuery,
  ...props
}) => {
  const { LAST, OLDER } = TASKS_DASHBOARD_AVAILABLE_QUERY_MODES;
  const focusedOn = getFocusedOn(query, wantedQueryState, time);
  const onTotalClick = () => updateQuery({ state: wantedQueryState });

  return (
    <Card
      className={classNames('tasks-donut-card', className, {
        'selected-tasks-card':
          focusedOn !== TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.NORMAL &&
          focusedOn !== TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.NONE,
      })}
      {...props}
    >
      <Card.Title onClick={onTotalClick}>{title}</Card.Title>
      <Card.Body>
        <TasksDonutChart
          last={data.last}
          older={data.older}
          time={getTimeText(time)}
          focusedOn={focusedOn}
          onTotalClick={onTotalClick}
          onLastClick={() =>
            updateQuery({
              state: wantedQueryState,
              mode: LAST,
              time: TASKS_DASHBOARD_CURRENT_TIME,
            })
          }
          onOlderClick={() =>
            updateQuery({
              state: wantedQueryState,
              mode: OLDER,
              time: TASKS_DASHBOARD_CURRENT_TIME,
            })
          }
        />
      </Card.Body>
    </Card>
  );
};

TasksDonutCard.propTypes = {
  title: PropTypes.string,
  data: PropTypes.shape({
    last: PropTypes.number.isRequired,
    older: PropTypes.number.isRequired,
  }),
  time: timePropType,
  query: queryPropType,
  wantedQueryState: PropTypes.string,
  className: PropTypes.string,
  updateQuery: PropTypes.func,
};

TasksDonutCard.defaultProps = {
  title: '',
  data: { last: 0, older: 0 },
  query: {},
  wantedQueryState: '',
  time: TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
  className: '',
  updateQuery: () => null,
};

export default TasksDonutCard;
