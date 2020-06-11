import React from 'react';

import API from 'foremanReact/API';
import { IntegrationTestHelper } from '@theforeman/test';

import TaskDetails, { reducers } from '../index';
import { selectForemanTasks } from '../../../ForemanTasksSelectors';
import { minProps } from './TaskDetails.fixtures';

jest.mock('../../../ForemanTasksSelectors');
jest.mock('foremanReact/API');
selectForemanTasks.mockImplementation(state => state);
describe('TaskDetails integration test', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    const expectedIntervalId = 1;
    jest.useFakeTimers();
    setInterval.mockImplementation(() => expectedIntervalId);
    delete window.location;
    window.location = new URL(
      'https://foreman.com/foreman_tasks/tasks/a15dd820-32f1-4ced-9ab7-c0fab8234c47/'
    );
  });
  it('should flow', async () => {
    window.location.reload = jest.fn();

    API.get.mockImplementationOnce();
    const integrationTestHelper = new IntegrationTestHelper(reducers);

    const component = integrationTestHelper.mount(
      <TaskDetails {...minProps} id="test" />
    );
    integrationTestHelper.takeStoreSnapshot('initial state');

    const reloadButton = component.find('.reload-button').at(0);
    reloadButton.simulate('click');
    await IntegrationTestHelper.flushAllPromises();

    integrationTestHelper.takeActionsSnapshot(
      'task details reload start with error'
    );

    reloadButton.simulate('click');
    await IntegrationTestHelper.flushAllPromises();
    jest.advanceTimersByTime(1);
    integrationTestHelper.takeActionsSnapshot('task details reload stop');
    jest.useRealTimers();
  });

  it('should change the data after reload', async () => {
    API.get.mockImplementationOnce(() => ({
      data: { label: 'new-label' },
    }));
    const integrationTestHelper = new IntegrationTestHelper(reducers);

    const component = integrationTestHelper.mount(
      <TaskDetails {...minProps} id="test" />
    );

    const reloadButton = component.find('.reload-button').at(0);
    reloadButton.simulate('click');

    await IntegrationTestHelper.flushAllPromises();
    integrationTestHelper.takeActionsSnapshot(
      'task details reload start without error'
    );
    integrationTestHelper.takeStoreAndLastActionSnapshot(
      'task details data should change'
    );
    jest.useRealTimers();
  });
});
