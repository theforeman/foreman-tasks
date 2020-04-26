import { testActionSnapshotWithFixtures } from '@theforeman/test';
import API from 'foremanReact/API';
import { TASKS_TABLE_ID } from '../TasksTableConstants';
import {
  getTableItems,
  cancelTask,
  resumeTask,
  bulkCancel,
  bulkResume,
  openClickedModal,
  openModalAction,
} from '../TasksTableActions';

jest.mock('foremanReact/components/common/table', () => ({
  getTableItemsAction: jest.fn(controller => controller),
}));

jest.mock('foremanReact/API');

API.post.mockImplementation(() => ({ data: 'some-data' }));

const taskInfo = {
  taskId: 'some-id',
  taskName: 'some-name',
};

const task = {
  id: 'some-id',
  name: 'some-name',
};

const fixtures = {
  'should cancelTask': () => cancelTask({ ...taskInfo, url: 'some-url' }),
  'should resumeTask': () => resumeTask({ ...taskInfo, url: 'some-url' }),
  'handles bulkResume requests that fail': () => {
    const selected = [{ ...task, isResumable: true }];

    API.post.mockImplementation(() =>
      Promise.reject(new Error('Network Error'))
    );
    return bulkResume({ selected, url: 'some-url' });
  },
  'handles resumable bulkResume requests': () => {
    const selected = [{ ...task, isResumable: true }];

    API.post.mockImplementation(() => ({
      data: {
        resumed: [{ action: 'I am resumed' }],
        failed: [{ action: 'I am failed' }],
      },
    }));
    return bulkResume({ selected, url: 'some-url' });
  },
  'handles bulkCancel requests': () => {
    const selected = [{ ...task, isCancellable: true }];

    API.post.mockImplementation(() => ({
      data: {
        cancelled: [{ action: 'I am cancelled' }],
      },
    }));
    return bulkCancel({ selected, url: 'some-url' });
  },
  'handles bulkCancel requests that fail': () => {
    const selected = [{ ...task, isCancellable: true }];

    API.post.mockImplementation(() =>
      Promise.reject(new Error('Network Error'))
    );
    return bulkCancel({ selected, url: 'some-url' });
  },
  'handles skipped bulkResume requests': () => {
    const selected = [{ ...task, isResumable: true }];

    API.post.mockImplementation(() => ({
      data: {
        skipped: [{ action: 'I am skipped' }],
      },
    }));
    return bulkResume({ selected, url: 'some-url' });
  },
  'handles skipped bulkCancel requests': () => {
    const selected = [{ ...task, isCancellable: true }];

    API.post.mockImplementation(() => ({
      data: {
        skipped: [{ action: 'I am skipped' }],
      },
    }));
    return bulkCancel({ selected, url: 'some-url' });
  },
  'handles bulkCancel requests that are not cancellable': () => {
    const selected = [{ ...task, isCancellable: false }];
    return bulkCancel({ selected, url: 'some-url' });
  },
  'handles bulkResume requests that are not resumable': () => {
    const selected = [{ ...task, isResumable: false, isCancellable: false }];
    return bulkResume({ selected, url: 'some-url' });
  },

  'handles openClickedModal': () =>
    openClickedModal({ ...taskInfo, setModalOpen: jest.fn() }),
  'handles openModalAction': () => openModalAction('some-modal-id', jest.fn()),
};
describe('TasksTable actions', () => {
  it('getTableItems should reuse common/table/getTableItemsAction', () => {
    expect(getTableItems('')).toEqual(TASKS_TABLE_ID);
  });
  testActionSnapshotWithFixtures(fixtures);
  it('openClickedModal opens modal', () => {
    const setModalOpen = jest.fn();
    openClickedModal({ ...taskInfo, setModalOpen });
    expect(setModalOpen).toHaveBeenCalled();
  });
  it('openModalAction opens modal', () => {
    const setModalOpen = jest.fn();
    openModalAction('some-modal-id', setModalOpen);
    expect(setModalOpen).toHaveBeenCalled();
  });
});
