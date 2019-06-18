import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, object, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS,
  TASKS_DASHBOARD_AVAILABLE_QUERY_MODES,
} from '../../TasksDashboardConstants';
import { MOCKED_DATA } from './TasksCardsGrid.fixtures';
import TasksCardsGrid from './TasksCardsGrid';

const createSelect = (name, options) =>
  select(name, { ...options, NONE: 'none' }, 'none');

storiesOf('TasksDashboard/TasksCardsGrid', module)
  .addDecorator(withKnobs)
  .add('TasksCardsGrid', () => {
    const selectTime = select(
      'time',
      TASKS_DASHBOARD_AVAILABLE_TIMES,
      TasksCardsGrid.defaultProps.time
    );
    const selectState = createSelect(
      'query.state',
      TASKS_DASHBOARD_AVAILABLE_QUERY_STATES
    );
    const selectResult = createSelect(
      'query.result',
      TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS
    );
    const selectMode = createSelect(
      'query.mode',
      TASKS_DASHBOARD_AVAILABLE_QUERY_MODES
    );

    return (
      <div>
        <TasksCardsGrid
          time={selectTime}
          query={{
            state: selectState,
            result: selectResult,
            mode: selectMode,
            time: selectTime,
          }}
          data={object('data', MOCKED_DATA)}
          updateQuery={action('updateQuery')}
        />
      </div>
    );
  });
