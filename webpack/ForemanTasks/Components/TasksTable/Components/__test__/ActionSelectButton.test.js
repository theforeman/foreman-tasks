import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import { ActionSelectButton } from '../ActionSelectButton';

const fixtures = {
  'renders with minimal props': {
    onCancel: jest.fn(),
    onResume: jest.fn(),
    onForceCancel: jest.fn(),
  },
};

describe('ActionSelectButton', () =>
  testComponentSnapshotsWithFixtures(ActionSelectButton, fixtures));
