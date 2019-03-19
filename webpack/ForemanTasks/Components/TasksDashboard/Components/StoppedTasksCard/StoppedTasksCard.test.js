import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';
import StoppedTasksCard from './StoppedTasksCard';

const createRequiredProps = () => ({
  error: {
    total: {
      value: 8,
      onClick: () => null,
    },
    last: {
      value: 1,
      onClick: () => null,
    },
  },
  warning: {
    total: {
      value: 20,
      onClick: () => null,
    },
    last: {
      value: 2,
      onClick: () => null,
    },
  },
  success: {
    total: {
      value: 25,
      onClick: () => null,
    },
    last: {
      value: 3,
      onClick: () => null,
    },
  },
  timePeriod: '24h',
  focusedOn: {
    normal: true,
  },
});

const fixtures = {
  // 'render with minimal props': {},
  'render with props': { ...createRequiredProps() },
};

describe('StoppedTasksCard', () =>
  testComponentSnapshotsWithFixtures(StoppedTasksCard, fixtures));
