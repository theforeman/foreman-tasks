import React from 'react';
import { screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { IntlProvider } from 'react-intl';

import { rtlHelpers } from 'foremanReact/common/testHelpers';
import { STATUS } from 'foremanReact/constants';

import {
  FOREMAN_TASK_DETAILS,
  VIEW_FOREMAN_TASKS,
} from '../../../Components/TaskDetails/TaskDetailsConstants';
import TaskDetailsPage from '../index';

const { renderWithStore } = rtlHelpers;

jest.mock('../../../Components/TaskDetails/TaskDetailsActions', () => {
  const actual = jest.requireActual(
    '../../../Components/TaskDetails/TaskDetailsActions'
  );

  return {
    ...actual,
    taskReloadStart: jest.fn(() => () => undefined),
    taskReloadStop: jest.fn(() => () => undefined),
  };
});

const mockUseForemanPermissions = jest.fn(
  () => new Set(['view_foreman_tasks'])
);

jest.mock('foremanReact/Root/Context/ForemanContext', () => ({
  ...jest.requireActual('foremanReact/Root/Context/ForemanContext'),
  useForemanPermissions: (...args) => mockUseForemanPermissions(...args),
}));

const routerPropsBase = {
  history: { push: jest.fn(), replace: jest.fn(), go: jest.fn() },
  location: {
    pathname: '/foreman_tasks/tasks/task-route-id',
    search: '',
    hash: '',
    state: undefined,
  },
};

const matchDefault = {
  params: { id: 'task-route-id' },
  path: '/foreman_tasks/tasks/:id',
  url: '/foreman_tasks/tasks/task-route-id',
  isExact: true,
};

const baseTaskPayload = {
  action: '',
  input: [],
  output: {},
  locks: [],
  links: [],
  depends_on: [],
  blocks: [],
  failed_steps: [],
  running_steps: [],
  execution_plan: {},
  state: 'running',
  result: '',
};

const createStoreForTaskPayload = (overrides, apiStatus = STATUS.RESOLVED) => ({
  API: {
    [FOREMAN_TASK_DETAILS]: {
      response: { ...baseTaskPayload, ...overrides },
      status: apiStatus,
      payload: {},
    },
  },
});

const expectHeaderActionsHidden = () => {
  expect(
    screen.queryByRole('button', { name: /cancel/i })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /^task actions$/i })
  ).not.toBeInTheDocument();
};

const getHeaderTitleArea = title =>
  screen.getByRole('heading', { level: 1, name: title }).parentElement
    .parentElement;

const renderPage = (
  apiPayloadOverrides = {},
  propsOverrides = {},
  apiStatus = STATUS.RESOLVED
) => {
  const history = createMemoryHistory({
    initialEntries: [`/foreman_tasks/tasks/${matchDefault.params.id}`],
  });

  window.history.pushState(
    {},
    '',
    `/foreman_tasks/tasks/${matchDefault.params.id}`
  );

  return renderWithStore(
    <IntlProvider locale="en">
      <Router history={history}>
        <TaskDetailsPage
          {...routerPropsBase}
          history={history}
          match={matchDefault}
          {...propsOverrides}
        />
      </Router>
    </IntlProvider>,
    createStoreForTaskPayload(apiPayloadOverrides, apiStatus)
  );
};

describe('TaskDetailsPage', () => {
  beforeEach(() => {
    mockUseForemanPermissions.mockImplementation(
      () => new Set(['view_foreman_tasks'])
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('permissions', () => {
    it(`renders the task details chrome when ${VIEW_FOREMAN_TASKS} is present`, () => {
      mockUseForemanPermissions.mockImplementation(
        () => new Set(['edit_foreman_tasks', VIEW_FOREMAN_TASKS])
      );

      renderPage({ action: 'Run job' });

      expect(
        screen.getByRole('navigation', { name: 'Breadcrumb' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Run job',
        })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { name: /Permission denied/i })
      ).not.toBeInTheDocument();
    });

    it(`shows ResourceLoadFailedEmptyState and lists ${VIEW_FOREMAN_TASKS} when it is absent`, () => {
      mockUseForemanPermissions.mockImplementation(() => new Set());

      renderPage({ action: 'Hidden task' });

      expect(
        screen.getByRole('heading', { name: /Permission denied/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /You do not have permission to view the task with id task-route-id/
        )
      ).toBeInTheDocument();
      expect(screen.getByText(VIEW_FOREMAN_TASKS)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Back to tasks/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('navigation', { name: 'Breadcrumb' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('tab', { name: /^task$/i })
      ).not.toBeInTheDocument();
      expectHeaderActionsHidden();
    });

    it('denies access when user only has edit_foreman_tasks without view', () => {
      mockUseForemanPermissions.mockImplementation(
        () => new Set(['edit_foreman_tasks'])
      );

      renderPage({});

      expect(
        screen.getByRole('heading', { name: /Permission denied/i })
      ).toBeInTheDocument();
      expect(screen.getByText(VIEW_FOREMAN_TASKS)).toBeInTheDocument();
      expect(
        screen.getByRole('navigation', { name: 'Breadcrumb' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('tab', { name: /^task$/i })
      ).not.toBeInTheDocument();
      expectHeaderActionsHidden();
    });

    it('hides header actions when the task API returns an error', () => {
      renderPage({ action: 'Failed load' }, {}, STATUS.ERROR);

      expect(
        screen.getByRole('heading', { name: /unable to load task/i })
      ).toBeInTheDocument();
      expectHeaderActionsHidden();
    });
  });

  it('shows running status icon when action is unset', () => {
    renderPage({});

    expect(
      screen.getByRole('heading', { level: 1, name: 'Task Details' })
    ).toBeInTheDocument();

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent(
      'Tasks'
    );
    expect(
      within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByText(
        /task-route-id/
      )
    ).toBeInTheDocument();

    const titleArea = getHeaderTitleArea('Task Details');

    expect(within(titleArea).getByTitle('Running')).toBeInTheDocument();
    expect(within(titleArea).queryByTitle('Error')).not.toBeInTheDocument();
  });

  it('uses task action for title and breadcrumb when loaded', () => {
    renderPage({ action: 'Refresh hosts' });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Refresh hosts' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cancel/i })
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /^Tasks$/ })).toHaveAttribute(
      'href',
      '/foreman_tasks/tasks'
    );
    expect(
      within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByText(
        'Refresh hosts'
      )
    ).toBeInTheDocument();
  });

  it('shows error status icon when task is stopped with error result', () => {
    renderPage({
      action: 'Some action',
      state: 'stopped',
      result: 'error',
    });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Some action' })
    ).toBeInTheDocument();
    expect(
      within(getHeaderTitleArea('Some action')).getByTitle('Error')
    ).toBeInTheDocument();

    expect(
      within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByText(
        'Some action'
      )
    ).toBeInTheDocument();
  });
});
