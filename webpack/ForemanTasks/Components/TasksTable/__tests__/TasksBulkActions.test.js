import { testActionSnapshotWithFixtures } from '@theforeman/test';
import { API } from 'foremanReact/redux/API';
import {
  bulkCancelById,
  bulkCancelBySearch,
  bulkResumeById,
  bulkResumeBySearch,
  bulkForceCancelById,
  bulkForceCancelBySearch,
} from '../TasksBulkActions';

jest.mock('foremanReact/components/common/table', () => ({
  getTableItemsAction: jest.fn(controller => controller),
}));

jest.mock('foremanReact/redux/API');

const task = {
  id: 'some-id',
  name: 'some-name',
};

const fixtures = {
  'handles bulkResumeById requests that fail': () => {
    const selected = [{ ...task, isResumable: true }];

    API.post.mockImplementation(() =>
      Promise.reject(new Error('Network Error'))
    );
    return bulkResumeById({ selected, url: 'some-url' });
  },
  'handles resumable bulkResumeById requests': () => {
    const selected = [{ ...task, isResumable: true }];

    API.post.mockImplementation(() => ({
      data: {
        resumed: [{ action: 'I am resumed' }],
        failed: [{ action: 'I am failed' }],
      },
    }));
    return bulkResumeById({ selected, url: 'some-url' });
  },
  'handles bulkCancelById requests': () => {
    const selected = [{ ...task, isCancellable: true }];

    API.post.mockImplementation(() => ({
      data: {
        cancelled: [{ action: 'I am cancelled' }],
      },
    }));
    return bulkCancelById({ selected, url: 'some-url' });
  },
  'handles skipped bulkResumeById requests': () => {
    const selected = [{ ...task, isResumable: true }];

    API.post.mockImplementation(() => ({
      data: {
        skipped: [{ action: 'I am skipped' }],
      },
    }));
    return bulkResumeById({ selected, url: 'some-url' });
  },
  'handles skipped bulkCancelById requests': () => {
    const selected = [{ ...task, isCancellable: true }];

    API.post.mockImplementation(() => ({
      data: {
        skipped: [{ action: 'I am skipped' }],
      },
    }));
    return bulkCancelById({ selected, url: 'some-url' });
  },

  'handles bulkForceCancelById requests': () => {
    const selected = [{ ...task, isCancellable: true }];

    API.post.mockImplementation(() => ({
      data: {
        stopped_length: 2,
        skipped_length: 4,
      },
    }));
    return bulkForceCancelById({ selected, url: 'some-url' });
  },

  'handles bulkForceCancelById requests that fail': () => {
    const selected = [{ ...task, isResumable: true }];

    API.post.mockImplementation(() =>
      Promise.reject(new Error('Network Error'))
    );
    return bulkForceCancelById({ selected, url: 'some-url' });
  },

  'handles bulkCancelById requests that are not cancellable': () => {
    const selected = [{ ...task, isCancellable: false }];
    return bulkCancelById({ selected, url: 'some-url' });
  },
  'handles bulkResumeById requests that are not resumable': () => {
    const selected = [{ ...task, isResumable: false, isCancellable: false }];
    return bulkResumeById({ selected, url: 'some-url' });
  },

  'handles bulkForceCancelById requests that are stopped': () => {
    const selected = [{ ...task, isResumable: false, state: 'stopped' }];
    return bulkForceCancelById({ selected, url: 'some-url' });
  },

  'handles bulkCancelBySearch requests': () => {
    API.post.mockImplementation(() => ({
      data: {
        cancelled: [{ action: 'I am cancelled' }],
        skipped: [{ action: 'I am skipped' }],
      },
    }));
    return bulkCancelBySearch({
      query: { search: {} },
      url: 'some-url',
      parentTaskID: 'parent',
    });
  },

  'handles bulkResumeBySearch requests': () => {
    API.post.mockImplementation(() => ({
      data: {
        cancelled: [{ action: 'I am cancelled' }],
        skipped: [{ action: 'I am skipped' }],
        failed: [{ action: 'I am failed' }],
      },
    }));
    return bulkResumeBySearch({
      query: { search: {} },
      url: 'some-url',
      parentTaskID: 'parent',
    });
  },
  'handles bulkForceCancelBySearch requests': () =>
    bulkForceCancelBySearch({
      query: { search: {} },
      url: 'some-url',
      parentTaskID: 'parent',
    }),
};

describe('TasksTable bulk actions', () => {
  testActionSnapshotWithFixtures(fixtures);
});
