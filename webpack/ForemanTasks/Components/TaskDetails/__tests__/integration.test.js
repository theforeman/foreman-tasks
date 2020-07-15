import React from 'react';

import { API } from 'foremanReact/redux/API';
import { IntegrationTestHelper } from '@theforeman/test';
import { STATUS } from 'foremanReact/constants';

import TaskDetails, { reducers } from '../index';
import { selectForemanTasks } from '../../../ForemanTasksSelectors';
import { minProps } from './TaskDetails.fixtures';

jest.mock('../../../ForemanTasksSelectors');
jest.mock('foremanReact/redux/API');
selectForemanTasks.mockImplementation(state => state);
describe('TaskDetails integration test', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    delete window.location;
    window.location = new URL(
      'https://foreman.com/foreman_tasks/tasks/a15dd820-32f1-4ced-9ab7-c0fab8234c47/'
    );
  });
  it('should flow', async () => {
    window.location.reload = jest.fn();
    API.get.mockImplementation(() => ({
      data: { label: 'new-label', state: 'stopped' },
    }));

    const integrationTestHelper = new IntegrationTestHelper(reducers);

    const component = integrationTestHelper.mount(
      <TaskDetails status={STATUS.RESOLVED} {...minProps} id="test" />
    );
    integrationTestHelper.takeStoreSnapshot('initial state');
    await IntegrationTestHelper.flushAllPromises();
    component.update();
    const reloadButton = component.find('.reload-button').at(0);
    reloadButton.simulate('click');
    await IntegrationTestHelper.flushAllPromises();

    integrationTestHelper.takeActionsSnapshot('task details reload start');

    reloadButton.simulate('click');
    await IntegrationTestHelper.flushAllPromises();
    jest.advanceTimersByTime(1);
    integrationTestHelper.takeActionsSnapshot(
      'task details reload stop after reload button click'
    );
    jest.useRealTimers();
  });

  it('should change the data after reload', async () => {
    API.get.mockImplementationOnce(() => ({
      data: { label: 'new-label-unchanged', state: 'stopped' },
    }));
    const integrationTestHelper = new IntegrationTestHelper(reducers);

    const component = integrationTestHelper.mount(
      <TaskDetails {...minProps} id="test" />
    );

    await IntegrationTestHelper.flushAllPromises();
    component.update();

    API.get.mockImplementationOnce(() => ({
      data: { label: 'new-label-changed', state: 'stopped' },
    }));
    integrationTestHelper.takeStoreSnapshot('initial state');
    const reloadButton = component.find('.reload-button').at(0);
    reloadButton.simulate('click');

    jest.runOnlyPendingTimers();
    await IntegrationTestHelper.flushAllPromises();
    integrationTestHelper.takeStoreSnapshot('task details data should change');
    jest.useRealTimers();
  });
});
