import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withCardsDecorator } from '../../../../../stories/decorators';

import { TASKS_DASHBOARD_AVAILABLE_TIMES } from '../../TasksDashboardConstants';
import TimeDropDown from './TimeDropDown';

storiesOf('TasksDashboard', module)
  .addDecorator(withKnobs)
  .addDecorator(withCardsDecorator)
  .add('TimeDropDown', () => (
    <TimeDropDown
      id="time-period-dropdown"
      selectedTime={select(
        'selectedTime',
        TASKS_DASHBOARD_AVAILABLE_TIMES,
        TASKS_DASHBOARD_AVAILABLE_TIMES.H24
      )}
      onChange={action('onChange')}
    />
  ));
