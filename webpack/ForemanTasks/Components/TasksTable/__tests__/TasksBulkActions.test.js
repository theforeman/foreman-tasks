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

jest.mock('foremanReact/components/ToastsList', () => ({
  addToast: toast => ({
    type: 'TOASTS_ADD',
    payload: {
      message: toast,
    },
  }),
}));

const task = {
  id: 'some-id',
  name: 'some-name',
  action: 'some-action',
  can_edit: true,
};

const fixtures = {
  'handles bulkResumeById requests that fail': () => {
    const selected = [{ ...task, available_actions: { resumable: true } }];

    API.post.mockImplementation(() =>
      Promise.reject(new Error('Network Error'))
    );
    return bulkResumeById({ selected, reloadPage: jest.fn() });
  },
  'handles skipped bulkResumeById requests': () => {
    const selected = [{ ...task, available_actions: { resumable: true } }];

    API.post.mockImplementation(() => ({
      data: {
        skipped: [{ action: 'I am skipped' }],
      },
    }));
    return bulkResumeById({ selected, reloadPage: jest.fn() });
  },
  'handles skipped bulkCancelById requests': () => {
    const selected = [{ ...task, available_actions: { cancellable: true } }];
    API.post.mockImplementation(() => ({
      data: {
        skipped: [{ action: 'I am skipped' }],
      },
    }));
    return bulkCancelById({ selected, reloadPage: jest.fn() });
  },
  'handles bulkForceCancelById requests that fail': () => {
    const selected = [
      {
        ...task,
        state: 'running',
        can_edit: true,
      },
    ];

    API.post.mockImplementation(() =>
      Promise.reject(new Error('Network Error'))
    );
    return bulkForceCancelById({
      selected,
      reloadPage: jest.fn(),
    });
  },

  'handles bulkCancelById requests that are not cancellable': () => {
    const selected = [{ ...task, available_actions: { cancellable: false } }];
    return bulkCancelById({ selected, reloadPage: jest.fn() });
  },
  'handles bulkResumeById requests that are not resumable': () => {
    const selected = [
      { ...task, available_actions: { resumable: false, cancellable: false } },
    ];
    return bulkResumeById({ selected, reloadPage: jest.fn() });
  },

  'handles bulkForceCancelById requests that are stopped': () => {
    const selected = [
      { ...task, available_actions: { resumable: false }, state: 'stopped' },
    ];
    return bulkForceCancelById({
      selected,
      reloadPage: jest.fn(),
    });
  },

  'handles bulkCancelBySearch requests': () => {
    API.post.mockImplementation(() => ({
      data: {
        cancelled: [{ action: 'I am cancelled' }],
        skipped: [{ action: 'I am skipped' }],
      },
    }));
    return bulkCancelBySearch({
      query: '',
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
      query: '',
      parentTaskID: 'parent',
    });
  },
  'handles bulkForceCancelBySearch requests': () =>
    bulkForceCancelBySearch({
      query: '',
      parentTaskID: 'parent',
    }),
  'handles bulkCancelById requests with canEdit false': () => {
    const selected = [
      {
        ...task,
        available_actions: { cancellable: true },
        can_edit: false,
      },
    ];
    return bulkCancelById({ selected, reloadPage: jest.fn() });
  },
  'handles bulkResumeById requests with canEdit false': () => {
    const selected = [
      {
        ...task,
        available_actions: { resumable: true },
        can_edit: false,
      },
    ];
    return bulkResumeById({ selected, reloadPage: jest.fn() });
  },
  'handles bulkForceCancelById requests with canEdit false': () => {
    const selected = [
      {
        ...task,
        state: 'running',
        available_actions: { resumable: false },
        can_edit: false,
      },
    ];
    return bulkForceCancelById({ selected, reloadPage: jest.fn() });
  },
};

describe('TasksBulkActions', () => {
  describe('Test reloadPage callback', () => {
    it('handles resumable bulkResumeById requests', async () => {
      const selected = [{ ...task, available_actions: { resumable: true } }];

      API.post.mockImplementation(() => ({
        data: {
          resumed: [{ action: 'I am resumed' }],
          failed: [{ action: 'I am failed' }],
        },
      }));
      const reloadPage = jest.fn();
      const action = bulkResumeById({
        selected,
        reloadPage,
      });
      const dispatch = jest.fn();
      await action(dispatch);
      expect(reloadPage).toHaveBeenCalled();
      expect(dispatch.mock.calls).toMatchSnapshot();
    });
    it('handles bulkCancelById requests', async () => {
      const selected = [{ ...task, available_actions: { cancellable: true } }];
      API.post.mockImplementation(() => ({
        data: {
          cancelled: [{ action: 'I am cancelled' }],
        },
      }));
      const reloadPage = jest.fn();
      const action = bulkCancelById({ selected, reloadPage });
      const dispatch = jest.fn();
      await action(dispatch);
      expect(reloadPage).toHaveBeenCalled();
      expect(dispatch.mock.calls).toMatchSnapshot();
    });
    it('handles bulkForceCancelById requests', async () => {
      const selected = [
        {
          ...task,
          state: 'running',
          can_edit: true,
        },
      ];

      API.post.mockImplementation(() => ({
        data: {
          stopped_length: 2,
          skipped_length: 4,
        },
      }));
      const reloadPage = jest.fn();
      const action = bulkForceCancelById({
        selected,
        reloadPage,
      });
      const dispatch = jest.fn();
      await action(dispatch);
      expect(reloadPage).toHaveBeenCalled();
      expect(dispatch.mock.calls).toMatchSnapshot();
    });
  });
  testActionSnapshotWithFixtures(fixtures);
});
