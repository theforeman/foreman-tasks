import React from 'react';

import API from 'foremanReact/API';
import { IntegrationTestHelper } from 'react-redux-test-utils';

import TaskDetails, { reducers } from '../index';
import { selectForemanTasks } from '../../../ForemanTasksSelectors';

jest.mock('../../../ForemanTasksSelectors');
jest.mock('foremanReact/API');
selectForemanTasks.mockImplementation(state => state);
describe('TaskDetails integration test', () => {
  it('should flow', async () => {
    jest.useFakeTimers();
    window.location.reload = jest.fn();

    API.get.mockImplementationOnce();
    const integrationTestHelper = new IntegrationTestHelper(reducers);

    const component = integrationTestHelper.mount(<TaskDetails id="test" />);
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
    jest.useFakeTimers();
    API.get.mockImplementationOnce(() => ({
      data: { label: 'new-label' },
    }));
    const integrationTestHelper = new IntegrationTestHelper(reducers);

    const component = integrationTestHelper.mount(<TaskDetails id="test" />);

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
