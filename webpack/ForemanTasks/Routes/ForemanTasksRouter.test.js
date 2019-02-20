import React from 'react';
import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

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
  'render without Props': {},
};

describe('ForemanTasksRouter', () =>
  testComponentSnapshotsWithFixtures(ForemanTasksRouter, fixtures));
