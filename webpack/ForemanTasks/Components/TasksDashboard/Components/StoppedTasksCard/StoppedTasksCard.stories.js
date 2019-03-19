import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, number, text, object } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withCardsDecorator } from '../../../../../stories/decorators';
import StoppedTasksCard from './StoppedTasksCard';

storiesOf('TasksDashboard', module)
  .addDecorator(withKnobs)
  .addDecorator(withCardsDecorator)
  .add('StoppedTasksCard', () => (
    <StoppedTasksCard
      onTitleClick={action('Update query to error total')}
      error={{
        total: {
          value: number('errorTotal', 8),
          onClick: action('Update query to error total'),
        },
        last: {
          value: number('errorLast', 1),
          onClick: action('Update query to error last'),
        },
      }}
      warning={{
        total: {
          value: number('warningTotal', 20),
          onClick: action('Update query to warning total'),
        },
        last: {
          value: number('warningLast', 2),
          onClick: action('Update query to warning last'),
        },
      }}
      success={{
        total: {
          value: number('successTotal', 25),
          onClick: action('Update query to success total'),
        },
        last: {
          value: number('successLast', 3),
          onClick: action('Update query to success last'),
        },
      }}
      timePeriod={text('timePeriod', '24h')}
      focusedOn={object('focusedOn', {
        normal: true,
      })}
    />
  ));
