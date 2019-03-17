import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import RunningTasksCard from './RunningTasksCard';

const createRequiredProps = () => ({ last: 3, older: 5 });

const fixtures = {
  'render with minimal props': { ...createRequiredProps() },
};

describe('RunningTasksCard', () =>
  testComponentSnapshotsWithFixtures(RunningTasksCard, fixtures));
