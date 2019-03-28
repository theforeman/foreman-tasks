import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, object } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { Grid } from 'patternfly-react';

import { TASKS_DASHBOARD_AVAILABLE_TIMES } from '../../TasksDashboardConstants';
import TasksLabelsRow from './TasksLabelsRow';

storiesOf('TasksDashboard/TasksLabelsRow', module)
  .addDecorator(withKnobs)
  .addDecorator(storyFn => <Grid style={{ padding: 40 }}>{storyFn()}</Grid>)
  .add('TasksLabelsRow', () => (
    <TasksLabelsRow
      query={object('query', {
        state: 'running',
        mode: 'last',
        time: TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
      })}
      deleteQueryKey={action('deleteQueryKey')}
    />
  ));
