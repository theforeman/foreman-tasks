import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import PausedTasksCard from './PausedTasksCard';

const createRequiredProps = () => ({ last: 3, older: 5 });

const fixtures = {
  'render with minimal props': { ...createRequiredProps() },
};

describe('PausedTasksCard', () =>
  testComponentSnapshotsWithFixtures(PausedTasksCard, fixtures));
