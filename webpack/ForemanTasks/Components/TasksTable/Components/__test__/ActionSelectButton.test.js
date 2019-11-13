import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import { ActionSelectButton } from '../ActionSelectButton';

const fixtures = {
  'renders with minimal props': {
    onCancel: jest.fn(),
    onResume: jest.fn(),
  },
};

describe('ActionSelectButton', () =>
  testComponentSnapshotsWithFixtures(ActionSelectButton, fixtures));
