import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import { TASKS_DASHBOARD_AVAILABLE_TIMES } from '../../../../TasksDashboardConstants';
import TimeDropDown from './TimeDropDown';

const createRequiredProps = () => ({ id: 'some-id' });

const fixtures = {
  'render with minimal props': { ...createRequiredProps() },
  'render with all props': {
    ...createRequiredProps(),
    className: 'some-class',
    selectedTime: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
    onChange: jest.fn(),
  },
};

describe('TimeDropDown', () =>
  testComponentSnapshotsWithFixtures(TimeDropDown, fixtures));
