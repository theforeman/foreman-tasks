import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import TaskDetails from '../TaskDetails';
import { minProps } from './TaskDetails.fixtures';

delete window.location;
window.location = new URL(
  'https://foreman.com/foreman_tasks/tasks/a15dd820-32f1-4ced-9ab7-c0fab8234c47/'
);

const store = configureStore({ reducer: state => state || {} });

function renderTaskDetails(props = {}) {
  return render(
    <Provider store={store}>
      <TaskDetails {...minProps} {...props} />
    </Provider>
  );
}

describe('TaskDetails', () => {
  it('shows generic EmptyState when status is ERROR', () => {
    renderTaskDetails({
      status: 'ERROR',
      apiErrorMessage: 'some-error',
    });

    expect(screen.getByRole('heading', { name: /^error$/i })).toBeInTheDocument();
    expect(screen.getByText('some-error')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /^task$/i })).not.toBeInTheDocument();
  });

  it('shows generic EmptyState when apiStatus is ERROR', () => {
    renderTaskDetails({
      status: 'RESOLVED',
      apiStatus: 'ERROR',
      apiErrorMessage: 'api-error',
    });

    expect(screen.getByRole('heading', { name: /^error$/i })).toBeInTheDocument();
    expect(screen.getByText('api-error')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /^task$/i })).not.toBeInTheDocument();
  });

  it('shows PermissionDenied when apiErrorCode is 403', () => {
    renderTaskDetails({
      status: 'RESOLVED',
      apiStatus: 'ERROR',
      apiErrorCode: 403,
      apiErrorMessage: 'Forbidden',
    });

    expect(screen.getByText('Permission Denied')).toBeInTheDocument();
    expect(screen.getByText('view_foreman_tasks')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /^error$/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /^task$/i })).not.toBeInTheDocument();
  });

  it('shows EmptyState when apiErrorCode is 404', () => {
    renderTaskDetails({
      status: 'RESOLVED',
      apiStatus: 'ERROR',
      apiErrorCode: 404,
      apiErrorMessage: 'Task missing',
    });

    expect(
      screen.getByRole('heading', { name: /task not found/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Task missing')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /^error$/i })
    ).not.toBeInTheDocument();
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
