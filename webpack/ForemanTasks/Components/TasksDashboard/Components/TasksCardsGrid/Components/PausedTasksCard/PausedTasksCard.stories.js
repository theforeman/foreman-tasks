import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, number, text, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withCardsDecorator } from '../../../../../../../stories/decorators';

import {
  TASKS_DASHBOARD_AVAILABLE_QUERY_MODES,
  TASKS_DASHBOARD_AVAILABLE_TIMES,
} from '../../../../TasksDashboardConstants';
import PausedTasksCard from './PausedTasksCard';

storiesOf('TasksDashboard/TasksCardsGrid', module)
  .addDecorator(withKnobs)
  .addDecorator(withCardsDecorator)
  .add('PausedTasksCard', () => {
    const selectTime = select(
      'time',
      TASKS_DASHBOARD_AVAILABLE_TIMES,
      PausedTasksCard.defaultProps.time
    );

    const selectMode = select(
      'mode',
      { ...TASKS_DASHBOARD_AVAILABLE_QUERY_MODES, NONE: 'none' },
      'none'
    );
    return (
      <PausedTasksCard
        data={{
          last: number('data.last', 3),
          older: number('data.older', 5),
        }}
        time={selectTime}
        query={{
          state: text('query.state', 'some-state'),
          mode: selectMode,
          time: selectTime,
        }}
        updateQuery={action('updateQuery')}
      />
    );
  });
