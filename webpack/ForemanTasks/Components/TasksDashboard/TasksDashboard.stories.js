import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { tasksDashboardProps } from './TasksDashboard.fixtures';

import TasksDashboard from './TasksDashboard';
import './TasksDashboard.scss';

storiesOf('TasksDashboard', module)
  .addDecorator(withKnobs)
  .add('TasksDashboard', () => (
    <div>
      <link
        href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
        rel="stylesheet"
        integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN"
        crossOrigin="anonymous"
      />
      <TasksDashboard tasksSummary={tasksDashboardProps.tasksSummary} />
    </div>
  ));
