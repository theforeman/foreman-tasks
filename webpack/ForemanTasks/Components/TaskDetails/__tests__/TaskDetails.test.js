import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

import TaskDetails from '../TaskDetails';
import { minProps } from './TaskDetails.fixtures';

jest.mock('foremanReact/Root/Context/ForemanContext', () => ({
  ...jest.requireActual('foremanReact/Root/Context/ForemanContext'),
  useForemanPermissions: () => new Set(['view_foreman_tasks']),
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
  it('shows ResourceLoadFailedEmptyState when status is ERROR', () => {
    renderTaskDetails({
      status: 'ERROR',
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

  it('shows ResourceLoadFailedEmptyState when apiStatus is ERROR', () => {
    renderTaskDetails({
      status: 'RESOLVED',
      apiStatus: 'ERROR',
      apiErrorMessage: 'api-error',
    });

    expect(
      screen.getByRole('heading', { name: /unable to load task/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Server returned: api-error')
    ).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /^task$/i })).not.toBeInTheDocument();
  });

  it('shows permission denied when apiErrorCode is 403', () => {
    renderTaskDetails({
      status: 'RESOLVED',
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
      status: 'RESOLVED',
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

  it('shows skeleton while loading on the Task tab', () => {
    const { container } = renderTaskDetails({ isLoading: true });
    expect(
      container.querySelector('.react-loading-skeleton')
    ).toBeInTheDocument();
  });

  it('renders six tabs with expected labels', () => {
    renderTaskDetails();
    expect(document.getElementById('task-details-tabs')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^task$/i })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /running steps/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /errors/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /locks/i })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /dependencies/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /raw/i })).toBeInTheDocument();
  });
});
