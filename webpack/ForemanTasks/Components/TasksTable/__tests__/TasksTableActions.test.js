import {
  testActionSnapshotWithFixtures,
  IntegrationTestHelper,
} from '@theforeman/test';
import { TASKS_TABLE_ID } from '../TasksTableConstants';
import {
  getTableItems,
  cancelTask,
  resumeTask,
  forceCancelTask,
  selectPage,
  openClickedModal,
  openModalAction,
} from '../TasksTableActions';

jest.mock('foremanReact/components/common/table', () => ({
  getTableItemsAction: jest.fn(controller => controller),
}));

const taskInfo = {
  taskId: 'some-id',
  taskName: 'some-name',
};

const fixtures = {
  'should selectPage and succeed': () => selectPage([{ id: 'some-id' }]),
  'handles openClickedModal': () =>
    openClickedModal({ ...taskInfo, setModalOpen: jest.fn() }),
  'handles openModalAction': () => openModalAction('some-modal-id', jest.fn()),
};
describe('TasksTable actions', () => {
  it('getTableItems should reuse common/table/getTableItemsAction', () => {
    expect(getTableItems('')).toEqual(TASKS_TABLE_ID);
  });

  it('should resumeTask', async () => {
    const dispatch = jest.fn();
    resumeTask({ ...taskInfo, url: 'some-url' })(dispatch);
    await IntegrationTestHelper.flushAllPromises();
    expect(dispatch.mock.calls).toHaveLength(3);
  });
  it('should cancelTask', async () => {
    const dispatch = jest.fn();
    cancelTask({ ...taskInfo, url: 'some-url' })(dispatch);
    await IntegrationTestHelper.flushAllPromises();
    expect(dispatch.mock.calls).toHaveLength(3);
  });
  it('should forceCancelTask', async () => {
    const dispatch = jest.fn();
    forceCancelTask({ ...taskInfo, url: 'some-url' })(dispatch);
    await IntegrationTestHelper.flushAllPromises();
    expect(dispatch.mock.calls).toHaveLength(3);
  });
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
  testActionSnapshotWithFixtures(fixtures);
});
