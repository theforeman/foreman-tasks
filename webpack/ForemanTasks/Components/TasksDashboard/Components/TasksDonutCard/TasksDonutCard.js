import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card } from 'patternfly-react';
import { shouleBeSelected } from '../TasksDonutChart/TasksDonutChartHelper';
import TasksDonutChart from '../TasksDonutChart/TasksDonutChart';
import './TasksDonutCard.scss';

const TasksDonutCard = ({
  title,
  className,
  focusedOn,
  onTotalClick,
  ...props
}) => (
  <Card
    className={classNames('tasks-donut-card', className, {
      'selected-tasks-card': shouleBeSelected(focusedOn),
    })}
  >
    <Card.Title onClick={onTotalClick}>{title}</Card.Title>
    <Card.Body>
      <TasksDonutChart
        focusedOn={focusedOn}
        onTotalClick={onTotalClick}
        {...props}
      />
    </Card.Body>
  </Card>
);

TasksDonutCard.propTypes = {
  ...TasksDonutChart.propTypes,
  title: PropTypes.string,
  className: PropTypes.string,
  focusedOn: TasksDonutChart.propTypes.focusedOn,
};

TasksDonutCard.defaultProps = {
  title: '',
  className: '',
  focusedOn: {},
};

export default TasksDonutCard;
