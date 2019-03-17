import React from 'react';
import PropTypes from 'prop-types';
import { Button, DropdownButton, MenuItem } from 'patternfly-react';

import {
  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES,
  TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS,
} from './TasksDashboardConstants';
import { getTimePeriodText } from './TasksDashboardHelper';
import './TasksDashboard.scss';

const TasksDashboard = ({
  timePeriod,
  running,
  paused,
  stopped,
  scheduled,
  updateTimePeriod,
  updateSearchQuery,
}) => {
  const timePeriodText = getTimePeriodText(timePeriod);

  return (
    <div className="tasks-dashboard-container">
      <div>
        <span>Time period:</span>
        <DropdownButton
          title={timePeriodText}
          id="tasks-dashboard-time-period-dropdown"
        >
          {Object.keys(TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS).map(
            currentTimePeriod => (
              <MenuItem
                key={currentTimePeriod}
                active={currentTimePeriod === timePeriod}
                onClick={() => updateTimePeriod(currentTimePeriod)}
              >
                {getTimePeriodText(currentTimePeriod)}
              </MenuItem>
            )
          )}
        </DropdownButton>
      </div>
      <div>
        <Button
          active={running.selected}
          onClick={() =>
            updateSearchQuery([
              TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.RUNNING,
            ])
          }
        >
          running
        </Button>
        <div>
          <Button
            active={running.lastSelected}
            onClick={() =>
              updateSearchQuery(
                [
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.RUNNING,
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.LAST,
                ],
                timePeriod
              )
            }
          >
            running last {timePeriodText}
          </Button>
          <Button
            active={running.overSelected}
            onClick={() =>
              updateSearchQuery(
                [
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.RUNNING,
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.OVER,
                ],
                timePeriod
              )
            }
          >
            running over {timePeriodText}
          </Button>
        </div>
      </div>
      <div>
        <Button
          active={paused.selected}
          onClick={() =>
            updateSearchQuery([
              TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.PAUSED,
            ])
          }
        >
          paused
        </Button>
        <div>
          <Button
            active={paused.lastSelected}
            onClick={() =>
              updateSearchQuery(
                [
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.PAUSED,
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.LAST,
                ],
                timePeriod
              )
            }
          >
            paused last {timePeriodText}
          </Button>
          <Button
            active={paused.overSelected}
            onClick={() =>
              updateSearchQuery(
                [
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.PAUSED,
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.OVER,
                ],
                timePeriod
              )
            }
          >
            paused over {timePeriodText}
          </Button>
        </div>
      </div>
      <div>
        <Button
          active={stopped.selected}
          onClick={() =>
            updateSearchQuery([
              TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.STOPPED,
            ])
          }
        >
          stopped
        </Button>
        <div>
          <Button
            active={stopped.errorSelected}
            onClick={() =>
              updateSearchQuery([
                TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.STOPPED,
                TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.ERROR,
              ])
            }
          >
            stopped error total
          </Button>
          <Button
            active={stopped.warningSelected}
            onClick={() =>
              updateSearchQuery([
                TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.STOPPED,
                TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.WARNING,
              ])
            }
          >
            stopped warning total
          </Button>
          <Button
            active={stopped.successSelected}
            onClick={() =>
              updateSearchQuery([
                TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.STOPPED,
                TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.SUCCESS,
              ])
            }
          >
            stopped success total
          </Button>
        </div>
        <div>
          <Button
            active={stopped.errorLastSelected}
            onClick={() =>
              updateSearchQuery(
                [
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.STOPPED,
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.ERROR,
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.LAST,
                ],
                timePeriod
              )
            }
          >
            stopped error last {timePeriodText}
          </Button>
          <Button
            active={stopped.warningLastSelected}
            onClick={() =>
              updateSearchQuery(
                [
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.STOPPED,
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.WARNING,
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.LAST,
                ],
                timePeriod
              )
            }
          >
            stopped warning last {timePeriodText}
          </Button>
          <Button
            active={stopped.successLastSelected}
            onClick={() =>
              updateSearchQuery(
                [
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.STOPPED,
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.SUCCESS,
                  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.LAST,
                ],
                timePeriod
              )
            }
          >
            stopped success last {timePeriodText}
          </Button>
        </div>
      </div>
      <div>
        <Button
          active={scheduled.selected}
          onClick={() =>
            updateSearchQuery([
              TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.SCHEDULED,
            ])
          }
        >
          scheduled
        </Button>
      </div>
    </div>
  );
};

const chartCardPropTypes = {
  selected: PropTypes.bool,
  lastSelected: PropTypes.bool,
  overSelected: PropTypes.bool,
};

const stoppedCardPropTypes = {
  selected: PropTypes.bool,
  errorSelected: PropTypes.bool,
  warningSelected: PropTypes.bool,
  successSelected: PropTypes.bool,
  errorLastSelected: PropTypes.bool,
  warningLastSelected: PropTypes.bool,
  successLastSelected: PropTypes.bool,
};

const scheduledCardPropTypes = {
  selected: PropTypes.bool,
};

TasksDashboard.propTypes = {
  timePeriod: PropTypes.oneOf(
    Object.values(TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS)
  ),
  running: PropTypes.shape(chartCardPropTypes),
  paused: PropTypes.shape(chartCardPropTypes),
  scheduled: PropTypes.shape(scheduledCardPropTypes),
  stopped: PropTypes.shape(stoppedCardPropTypes),
  updateSearchQuery: PropTypes.func,
  updateTimePeriod: PropTypes.func,
};

TasksDashboard.defaultProps = {
  timePeriod: TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS.H24,
  running: {
    selected: false,
    lastSelected: false,
    overSelected: false,
  },
  paused: {
    selected: false,
    lastSelected: false,
    overSelected: false,
  },
  scheduled: {
    selected: false,
  },
  stopped: {
    selected: false,
    errorSelected: false,
    warningSelected: false,
    successSelected: false,
    errorLastSelected: false,
    warningLastSelected: false,
    successLastSelected: false,
  },
  updateSearchQuery: () => null,
  updateTimePeriod: () => null,
};

export default TasksDashboard;
