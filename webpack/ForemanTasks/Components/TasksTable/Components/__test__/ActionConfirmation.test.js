import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import { ActionConfirmation } from '../ActionConfirmation';

const fixtures = {
  'renders ActionConfirmation': {
    showModal: true,
    title: 'title',
    message: 'message',
    confirmAction: 'confirmAction',
    abortAction: 'abortAction',
    closeModal: () => null,
    onClick: () => null,
  },
};

describe('ActionConfirmation', () =>
  testComponentSnapshotsWithFixtures(ActionConfirmation, fixtures));
