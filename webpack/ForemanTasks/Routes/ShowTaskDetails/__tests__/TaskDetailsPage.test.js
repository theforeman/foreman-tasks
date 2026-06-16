import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';

import breadcrumbBarReducer from 'foremanReact/components/BreadcrumbBar/BreadcrumbBarReducer';
import { STATUS } from 'foremanReact/constants';
import intervalsReducer from 'foremanReact/redux/middlewares/IntervalMiddleware/IntervalReducer';

import { FOREMAN_TASK_DETAILS } from '../../../Components/TaskDetails/TaskDetailsConstants';
import TaskDetailsPage from '../TaskDetailsPage';

const mockUseForemanPermissions = jest.fn(
  () => new Set(['view_foreman_tasks'])
);

jest.mock('foremanReact/Root/Context/ForemanContext', () => ({
  ...jest.requireActual('foremanReact/Root/Context/ForemanContext'),
  useForemanPermissions: (...args) => mockUseForemanPermissions(...args),
}));

const TASK_DETAILS_TITLE_ROW_OUIA_ID = 'foreman-tasks-task-details-title-row';

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

const createStoreForTaskPayload = overrides => ({
  API: {
    [FOREMAN_TASK_DETAILS]: {
      response: { ...baseTaskPayload, ...overrides },
      status: STATUS.RESOLVED,
      payload: {},
    },
  },
});

const rootReducer = combineReducers({
  API: (state = {}, action) => state,
  intervals: intervalsReducer,
  breadcrumbBar: breadcrumbBarReducer,
  foremanTasks: (state = {}, action) => state,
});

const renderPage = (apiPayloadOverrides = {}, propsOverrides = {}) => {
  const history = createMemoryHistory({
    initialEntries: [`/foreman_tasks/tasks/${matchDefault.params.id}`],
  });
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: createStoreForTaskPayload(apiPayloadOverrides),
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }),
  });

  window.history.pushState(
    {},
    '',
    `/foreman_tasks/tasks/${matchDefault.params.id}`
  );

  return render(
    <Router history={history}>
      <Provider store={store}>
        <IntlProvider locale="en">
          <TaskDetailsPage
            {...routerPropsBase}
            history={history}
            match={matchDefault}
            {...propsOverrides}
          />
        </IntlProvider>
      </Provider>
    </Router>
  );
};

const breadcrumbTitleHeadings = () =>
  screen.getAllByRole('heading', { level: 1 }).filter(
    heading => heading.getAttribute('data-ouia-component-id') === 'breadcrumb_title'
  );

/**
 * Title row (`customHeader` root `Flex`): same OUIA pattern as `Locks.test.js`.
 */
const taskDetailsTitleRegion = container => {
  const el = container.querySelector(
    `[data-ouia-component-id="${TASK_DETAILS_TITLE_ROW_OUIA_ID}"]`
  );

  expect(el).toBeTruthy();

  return el;
};

describe('TaskDetailsPage', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
    mockUseForemanPermissions.mockImplementation(() => new Set(['view_foreman_tasks']));
  });

  beforeEach(() => {
    mockUseForemanPermissions.mockImplementation(() => new Set(['view_foreman_tasks']));
  });

  describe('permissions', () => {
    const VIEW_PERM = 'view_foreman_tasks';

    it(`renders the task details chrome when ${VIEW_PERM} is present`, () => {
      mockUseForemanPermissions.mockImplementation(
        () => new Set(['edit_foreman_tasks', VIEW_PERM])
      );

      renderPage({ action: 'Run job' });

      expect(
        screen.getByRole('navigation', { name: 'Breadcrumb' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /Details of Run job task/,
        })
      ).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /Permission denied/i })).not.toBeInTheDocument();
      expect(mockUseForemanPermissions).toHaveBeenCalled();
    });

    it(`shows ResourceLoadFailedEmptyState and lists ${VIEW_PERM} when it is absent`, () => {
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
      expect(screen.getByText(VIEW_PERM)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Back to tasks/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('navigation', { name: 'Breadcrumb' })
      ).not.toBeInTheDocument();
      expect(screen.queryAllByRole('heading', { name: /Hidden task/i })).toHaveLength(0);
    });

    it('denies access when user only has edit_foreman_tasks without view', () => {
      mockUseForemanPermissions.mockImplementation(
        () => new Set(['edit_foreman_tasks'])
      );

      renderPage({});

      expect(
        screen.getByRole('heading', { name: /Permission denied/i })
      ).toBeInTheDocument();
      expect(screen.getByText(VIEW_PERM)).toBeInTheDocument();
      expect(
        screen.queryByRole('navigation', { name: 'Breadcrumb' })
      ).not.toBeInTheDocument();
    });
  });


  const expectToolbarHeadingText = substring => {
    const headings = breadcrumbTitleHeadings();

    expect(headings.length).toBeGreaterThan(0);

    headings.forEach(heading => {
      expect(heading).toHaveTextContent(substring);
    });
  };

  it('shows generic title and breadcrumb from route id when action is unset', () => {
    const page = renderPage({});
    expectToolbarHeadingText('Task Details');

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent(
      'Tasks'
    );
    expect(
      within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByText(
        /task-route-id/
      )
    ).toBeInTheDocument();

    const titleRegion = taskDetailsTitleRegion(page.container);

    expect(
      within(titleRegion).getAllByRole('img', { hidden: true }).length
    ).toBeGreaterThan(0);
    expect(titleRegion.querySelector('[class*="danger"]')).toBeNull();
  });

  it('uses task action for title and breadcrumb when loaded', () => {
    renderPage({ action: 'Refresh hosts' });

    expectToolbarHeadingText('Details of Refresh hosts task');

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

  it('shows error status styling in the heading when task is stopped with error result', () => {
    const page = renderPage({
      action: 'Some action',
      state: 'stopped',
      result: 'error',
    });

    expectToolbarHeadingText('Details of Some action task');

    expect(
      taskDetailsTitleRegion(page.container).querySelector('[class*="danger"]')
    ).toBeTruthy();

    expect(
      within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByText(
        'Some action'
      )
    ).toBeInTheDocument();
  });
});
