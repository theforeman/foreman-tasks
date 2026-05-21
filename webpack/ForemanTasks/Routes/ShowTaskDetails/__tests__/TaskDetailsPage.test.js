import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';

import breadcrumbBarReducer from 'foremanReact/components/BreadcrumbBar/BreadcrumbBarReducer';
import { STATUS } from 'foremanReact/constants';
import intervalsReducer from 'foremanReact/redux/middlewares/IntervalMiddleware/IntervalReducer';

import { FOREMAN_TASK_DETAILS } from '../../../Components/TaskDetails/TaskDetailsConstants';
import TaskDetailsPage from '../TaskDetailsPage';

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

function renderPage(apiPayloadOverrides = {}, propsOverrides = {}) {
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
    <Provider store={store}>
      <IntlProvider locale="en">
        <TaskDetailsPage
          {...routerPropsBase}
          match={matchDefault}
          {...propsOverrides}
        />
      </IntlProvider>
    </Provider>
  );
}

function breadcrumbTitleHeadings() {
  return screen.getAllByRole('heading', { level: 1 }).filter(
    heading => heading.getAttribute('data-ouia-component-id') === 'breadcrumb_title'
  );
}

/**
 * Title row (`customHeader` root `Flex`): same OUIA pattern as `Locks.test.js`.
 */
function taskDetailsTitleRegion(container) {
  const el = container.querySelector(
    `[data-ouia-component-id="${TASK_DETAILS_TITLE_ROW_OUIA_ID}"]`
  );

  expect(el).toBeTruthy();

  return el;
}

describe('TaskDetailsPage', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
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
    expectToolbarHeadingText('Task details');

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
