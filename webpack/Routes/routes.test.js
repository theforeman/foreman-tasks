import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import ForemanTasksRoutes from './routes';

jest.mock(
  '../ForemanTasks/Components/TasksTable/TasksIndexPage',
  () =>
    function TasksTableIndexPageStub() {
      return <div data-testid="tasks-table-index-stub" />;
    }
);

jest.mock(
  '../ForemanTasks/Routes/ShowTask/ShowTask',
  () =>
    function ShowTaskStub() {
      return <div data-testid="show-task-stub" />;
    }
);

const routerProps = {
  history: { push: jest.fn(), replace: jest.fn(), go: jest.fn() },
  location: {
    pathname: '/foreman_tasks/tasks',
    search: '',
    hash: '',
    state: undefined,
  },
  match: {
    params: {},
    path: '/foreman_tasks/tasks',
    url: '/foreman_tasks/tasks',
    isExact: true,
  },
};

describe('ForemanTasks routes', () => {
  it('defines the foreman_tasks React paths', () => {
    expect(
      ForemanTasksRoutes.map(({ path, exact }) => ({ path, exact }))
    ).toEqual([
      { path: '/foreman_tasks/tasks', exact: true },
      { path: '/foreman_tasks/tasks/:id/sub_tasks', exact: true },
      { path: '/foreman_tasks/ex_tasks/:id', exact: undefined },
    ]);
  });

  it('each route render returns a mountable page', () => {
    const propsByIndex = [
      {
        ...routerProps,
        match: {
          ...routerProps.match,
          params: {},
          path: '/foreman_tasks/tasks',
          url: '/foreman_tasks/tasks',
        },
      },
      {
        ...routerProps,
        match: {
          ...routerProps.match,
          params: { id: '7' },
          path: '/foreman_tasks/tasks/:id/sub_tasks',
          url: '/foreman_tasks/tasks/7/sub_tasks',
        },
      },
      {
        ...routerProps,
        match: {
          ...routerProps.match,
          params: { id: '42' },
          path: '/foreman_tasks/ex_tasks/:id',
          url: '/foreman_tasks/ex_tasks/42',
        },
      },
    ];

    ForemanTasksRoutes.forEach((route, index) => {
      const { unmount } = render(route.render(propsByIndex[index]));

      if (index === 2) {
        expect(screen.getByTestId('show-task-stub')).toBeInTheDocument();
      } else {
        expect(
          screen.getByTestId('tasks-table-index-stub')
        ).toBeInTheDocument();
      }

      unmount();
    });
  });
});
