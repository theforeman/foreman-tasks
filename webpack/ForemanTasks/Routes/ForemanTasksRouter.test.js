import React from 'react';
import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import ForemanTasksRouter from './ForemanTasksRouter';

jest.mock('./ForemanTasksRoutes', () => ({
  someRoute: {
    path: '/some-route',
    render: props => <span {...props}>some-route</span>,
  },
  someOtherRoute: {
    path: '/some-other-route',
    render: props => <span {...props}>some-other-route</span>,
  },
}));

const fixtures = {
  'render without Props': {
    history: {
      push: jest.fn(),
    },
  },
};

describe('ForemanTasksRouter', () =>
  testComponentSnapshotsWithFixtures(ForemanTasksRouter, fixtures));
