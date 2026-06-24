import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

import TaskDetails from '../TaskDetails';
import {
  fixtureFailedExecutionDetail,
  fixtureWithDependencies,
  fixtureWithOverviewMessages,
  minProps,
  taskDetailsWithExecutionTabDefaults,
} from './TaskDetails.fixtures';
import { VIEW_FOREMAN_TASKS } from '../TaskDetailsConstants';

const mockUseForemanPermissions = jest.fn(
  () => new Set(['view_foreman_tasks'])
);

jest.mock('foremanReact/Root/Context/ForemanContext', () => ({
  ...jest.requireActual('foremanReact/Root/Context/ForemanContext'),
  useForemanPermissions: (...args) => mockUseForemanPermissions(...args),
}));

delete window.location;
window.location = new URL(
  'https://foreman.com/foreman_tasks/tasks/a15dd820-32f1-4ced-9ab7-c0fab8234c47/'
);

const store = configureStore({ reducer: state => state || {} });

function renderTaskDetails(props = {}) {
  const history = createMemoryHistory();

  return render(
    <Router history={history}>
      <Provider store={store}>
        <TaskDetails {...minProps} {...props} />
      </Provider>
    </Router>
  );
}

describe('TaskDetails', () => {
  beforeEach(() => {
    mockUseForemanPermissions.mockImplementation(
      () => new Set(['view_foreman_tasks'])
    );
  });

  it(`shows ResourceLoadFailedEmptyState when ${VIEW_FOREMAN_TASKS} is absent`, () => {
    mockUseForemanPermissions.mockImplementation(() => new Set());

    renderTaskDetails();

    expect(
      screen.getByRole('heading', { name: /permission denied/i })
    ).toBeInTheDocument();
    expect(screen.getByText(VIEW_FOREMAN_TASKS)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /back to tasks/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /^task$/i })).not.toBeInTheDocument();
  });

  it('shows ResourceLoadFailedEmptyState when apiStatus is ERROR', () => {
    renderTaskDetails({
      apiStatus: 'ERROR',
      apiErrorMessage: 'some-error',
    });

    expect(
      screen.getByRole('heading', { name: /unable to load task/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Server returned: some-error')
    ).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /^task$/i })).not.toBeInTheDocument();
  });

  it('shows permission denied when apiErrorCode is 403', () => {
    renderTaskDetails({
      apiStatus: 'ERROR',
      apiErrorCode: 403,
      apiErrorMessage: 'Forbidden',
    });

    expect(
      screen.getByRole('heading', { name: /permission denied/i })
    ).toBeInTheDocument();
    expect(screen.getByText('view_foreman_tasks')).toBeInTheDocument();
    expect(
      screen.getByText('Server returned: Forbidden')
    ).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /^task$/i })).not.toBeInTheDocument();
  });

  it('shows not found messaging when apiErrorCode is 404', () => {
    renderTaskDetails({
      apiStatus: 'ERROR',
      apiErrorCode: 404,
      apiErrorMessage: 'Task missing',
    });

    expect(
      screen.getByRole('heading', { name: /unable to load task/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/could not be found/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText('Server returned: Task missing')
    ).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /^task$/i })).not.toBeInTheDocument();
  });

  it('shows skeleton in the overview while loading', () => {
    const { container } = renderTaskDetails({ isLoading: true });
    expect(
      container.querySelector('.react-loading-skeleton')
    ).toBeInTheDocument();
  });

  it('renders four tabs with expected labels', () => {
    renderTaskDetails();
    expect(document.getElementById('task-details-tabs')).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /execution details/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /dependencies/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /locks/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /raw/i })).toBeInTheDocument();
  });

  it('exposes stable ouiaIds on tabs for automation', () => {
    renderTaskDetails();

    expect(
      document.querySelector(
        '[data-ouia-component-id="task-details-tab-execution-details"]'
      )
    ).toBeInTheDocument();
    expect(
      document.querySelector(
        '[data-ouia-component-id="task-details-tab-dependencies"]'
      )
    ).toBeInTheDocument();
    expect(
      document.querySelector(
        '[data-ouia-component-id="task-details-tab-locks"]'
      )
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-ouia-component-id="task-details-tab-raw"]')
    ).toBeInTheDocument();
  });

  it('shows failed step errors on the default execution details tab', () => {
    renderTaskDetails({
      ...fixtureFailedExecutionDetail,
      executionPlan: fixtureFailedExecutionDetail.executionPlan,
      failedSteps: fixtureFailedExecutionDetail.failedSteps,
    });

    expect(
      screen.getByRole('tab', {
        name: /action actions::katello::eventqueue::monitor is already active/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/failed task errors/i)).toBeInTheDocument();
  });

  it('starts task reload on mount and stops on unmount', () => {
    const taskReloadStart = jest.fn();
    const taskReloadStop = jest.fn();

    const { unmount } = renderTaskDetails({
      ...taskDetailsWithExecutionTabDefaults,
      taskReloadStart,
      taskReloadStop,
    });

    expect(taskReloadStart).toHaveBeenCalledWith(
      'a15dd820-32f1-4ced-9ab7-c0fab8234c47'
    );
    unmount();
    expect(taskReloadStop).toHaveBeenCalled();
  });

  it('renders task overview with action name when loaded', () => {
    renderTaskDetails({ ...taskDetailsWithExecutionTabDefaults });

    expect(
      screen.getByRole('heading', { level: 4, name: 'Refresh foo' })
    ).toBeInTheDocument();
  });

  it('shows execution details panel on the default tab when loaded', () => {
    renderTaskDetails({ ...taskDetailsWithExecutionTabDefaults });

    expect(
      document.getElementById('execution-details-panel')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /^no errors found$/i })
    ).toBeInTheDocument();
  });

  it('disables tabs and hides execution panel while loading', () => {
    renderTaskDetails({
      ...taskDetailsWithExecutionTabDefaults,
      isLoading: true,
    });

    expect(
      document.getElementById('execution-details-panel')
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /execution details/i })
    ).toBeDisabled();
    expect(screen.getByRole('tab', { name: /dependencies/i })).toBeDisabled();
    expect(screen.getByRole('tab', { name: /locks/i })).toBeDisabled();
    expect(screen.getByRole('tab', { name: /raw/i })).toBeDisabled();
  });

  it('renders troubleshooting help in the overview section', () => {
    renderTaskDetails({ ...fixtureWithOverviewMessages });

    expect(screen.getByText(/troubleshooting/i)).toBeInTheDocument();
    expect(screen.getByText('See logs')).toBeInTheDocument();
  });

  it('renders raw output when the Raw tab is selected', () => {
    renderTaskDetails({ ...fixtureWithOverviewMessages });

    fireEvent.click(screen.getByRole('tab', { name: /raw/i }));

    expect(screen.getByText(/raw output/i)).toBeInTheDocument();
    expect(screen.getByText(/partial output/i)).toBeInTheDocument();
  });

  it('renders dependency tables when the Dependencies tab is selected', () => {
    renderTaskDetails({ ...fixtureWithDependencies });

    fireEvent.click(screen.getByRole('tab', { name: /dependencies/i }));

    expect(
      screen.getByRole('link', { name: 'Foo Bar Action' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Test Action' })
    ).toBeInTheDocument();
  });
});
