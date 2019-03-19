import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, object, boolean } from '@storybook/addon-knobs';

import TasksDashboard from './TasksDashboard';

import './tasksDashboard.scss';

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
      <TasksDashboard
        focusedOn={object('Focused on', {
          running: object('running', {
            normal: boolean('Running normal', true),

            recent: boolean('Running recent', false),
            total: boolean('Running total', false),
          }),
          paused: object('paused', {
            normal: boolean('Paused normal', true),

            recent: boolean('Paused recent', false),
            total: boolean('Paused total', false),
          }),
          stopped: object('stopped', {
            normal: boolean('Stopped normal', true),

            success: object('success', {
              recent: boolean('recent', false),
              total: boolean('total', false),
            }),
            error: object('error', {
              recent: boolean('recent', false),
              total: boolean('total', false),
            }),
            warning: object('warning', {
              recent: boolean('recent', false),
              total: boolean('total', false),
            }),
          }),
          scheduled: object('scheduled', {
            normal: boolean('Scheduled normal', true),
            total: boolean('Scheduled total', false),
          }),
        })}
      />
    </div>
  ));
