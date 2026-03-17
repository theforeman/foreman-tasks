import React from 'react';
import { screen, within, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';

import { rtlHelpers } from 'foremanReact/common/testHelpers';

import TasksTableIndexPage from '../TasksIndexPage';
import { getRowKebabItems } from '../TasksColumns';
import { tasksSuccessResponse } from './TasksTable.fixtures';

const { renderWithStore } = rtlHelpers;

jest.mock(
  // C3 is causing issues in the test, and this test is not testing the DonutChart
  '../../TasksDashboard/Components/TasksCardsGrid/Components/TasksDonutChart/TasksDonutChart.js',
  () => ({
    __esModule: true,
    default: () => <div data-testid="donut-chart" />,
  })
);
const mockApiResponse = {
  ...tasksSuccessResponse,
  setAPIOptions: jest.fn(),
};

jest.mock('foremanReact/common/hooks/API/APIHooks', () => ({
  useAPI: jest.fn(() => mockApiResponse),
}));

const mockApiPost = jest.fn(() => Promise.resolve());
jest.mock('foremanReact/redux/API/API', () => ({
  __esModule: true,
  default: {
    get: () => Promise.resolve({}),
    put: () => Promise.resolve({}),
    post: (...args) => mockApiPost(...args),
    delete: () => Promise.resolve({}),
    patch: () => Promise.resolve({}),
  },
}));

const defaultProps = {
  match: { params: { id: null } },
  history: {
    location: { pathname: '/foreman_tasks/tasks', search: '' },
    push: jest.fn(),
  },
};

describe('TasksTableIndexPage', () => {
  const renderPage = (props = defaultProps) =>
    renderWithStore(
      <IntlProvider locale="en">
        <TasksTableIndexPage {...props} />
      </IntlProvider>
    );
  it('should render the Tasks header when not viewing subtasks', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Tasks' })).toBeInTheDocument();
  });

  it('should render the Sub tasks header and breadcrumb when viewing subtasks', () => {
    const propsWithParent = {
      ...defaultProps,
      match: { params: { id: 'parent-123' } },
    };

    renderPage(propsWithParent);

    expect(screen.getAllByText('Sub tasks')).toHaveLength(2);
  });

  it('renders each row with the correct data', () => {
    renderPage();

    const { results } = tasksSuccessResponse.response;

    results.forEach(task => {
      const actionLink = screen.getByRole('link', { name: task.action });
      const row = actionLink.closest('tr');
      expect(row).toBeInTheDocument();

      const rowScope = within(row);

      expect(actionLink).toHaveAttribute(
        'href',
        `/foreman_tasks/tasks/${task.id}`
      );
      expect(
        rowScope.getByRole('link', { name: task.action })
      ).toBeInTheDocument();
      expect(rowScope.getByText(task.state)).toBeInTheDocument();
      expect(rowScope.getByText(task.result)).toBeInTheDocument();

      const hasNoStartDate = task.started_at == null;
      if (hasNoStartDate) {
        expect(rowScope.getAllByText('N/A')).toHaveLength(2);
        const durationCell = rowScope.getByTitle('Task was canceled');
        expect(durationCell).toBeInTheDocument();
        expect(durationCell).toHaveClass('param-value');
        expect(durationCell).toHaveTextContent('N/A');
      }
    });
  });

  describe('row modal open, close, and action', () => {
    const { results } = tasksSuccessResponse.response;
    const resumableTask = results.find(
      r => r.available_actions && r.available_actions.resumable
    );
    const cancelOnlyTask = results.find(
      r =>
        r.available_actions?.cancellable &&
        !r.available_actions?.resumable &&
        r.state === 'stopped'
    );
    const forceCancelTask = results.find(r => r.state !== 'stopped');

    const openKebabAndClick = async (rowActionLabel, menuItemName) => {
      const row = screen
        .getByRole('link', { name: rowActionLabel })
        .closest('tr');
      const rowScope = within(row);
      fireEvent.click(rowScope.getByLabelText('Kebab toggle'));
      const item = await screen.findByRole('menuitem', {
        name: menuItemName,
      });
      fireEvent.click(item);
    };

    const openResumeModal = async () => {
      await openKebabAndClick(resumableTask.action, 'Resume');
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Resume Task' })
        ).toBeInTheDocument();
      });
    };

    const openCancelModal = async () => {
      await openKebabAndClick(cancelOnlyTask.action, 'Cancel');
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Cancel Task' })
        ).toBeInTheDocument();
      });
    };

    const openForceUnlockModal = async () => {
      await openKebabAndClick(forceCancelTask.action, 'Force Cancel');
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Force Unlock Task' })
        ).toBeInTheDocument();
      });
    };

    beforeEach(() => {
      mockApiPost.mockClear();
    });

    it('opens Resume modal when Resume is clicked in row kebab', async () => {
      renderPage();
      expect(
        screen.queryByRole('heading', { name: 'Resume Task' })
      ).not.toBeInTheDocument();

      await openResumeModal();
    });

    it('closes modal when No is clicked', async () => {
      renderPage();
      await openResumeModal();
      fireEvent.click(screen.getByRole('button', { name: 'No' }));

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: 'Resume Task' })
        ).not.toBeInTheDocument();
      });
    });

    it('calls API when Yes is clicked in Resume modal', async () => {
      renderPage();
      await openResumeModal();

      fireEvent.click(screen.getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledTimes(1);
      });
      expect(mockApiPost).toHaveBeenCalledWith(
        `/foreman_tasks/tasks/${resumableTask.id}/resume`
      );
    });

    it('calls API when Yes is clicked in Cancel modal', async () => {
      renderPage();
      await openCancelModal();

      fireEvent.click(screen.getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledTimes(1);
      });
      expect(mockApiPost).toHaveBeenCalledWith(
        `/foreman_tasks/tasks/${cancelOnlyTask.id}/cancel`
      );
    });

    it('calls API when Yes is clicked in Force Unlock modal', async () => {
      renderPage();
      await openForceUnlockModal();

      fireEvent.click(screen.getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledTimes(1);
      });
      expect(mockApiPost).toHaveBeenCalledWith(
        `/foreman_tasks/tasks/${forceCancelTask.id}/force_unlock`
      );
    });
  });
});

describe('Table columns and actions with tasksSuccessResponse', () => {
  const { results } = tasksSuccessResponse.response;

  describe('getRowKebabItems', () => {
    it('returns Resume for a resumable task when user can edit', () => {
      const setClickedTask = jest.fn();
      const openModal = jest.fn();
      const getItems = getRowKebabItems(setClickedTask, openModal);
      const resumableTask = results.find(
        r => r.available_actions && r.available_actions.resumable
      );
      expect(resumableTask).toBeDefined();
      const items = getItems({
        ...resumableTask,
        canEdit: resumableTask.can_edit,
      });
      const resumeItem = items.find(
        i => i.title && i.title.toLowerCase().includes('resume')
      );
      expect(resumeItem).toBeDefined();
      expect(typeof resumeItem.onClick).toBe('function');
    });

    it('returns Cancel for cancellable non-resumable stopped task when user can edit', () => {
      const setClickedTask = jest.fn();
      const openModal = jest.fn();
      const getItems = getRowKebabItems(setClickedTask, openModal);
      const cancelOnlyTask = results.find(
        r =>
          r.available_actions &&
          r.available_actions.cancellable &&
          !r.available_actions.resumable &&
          r.state === 'stopped'
      );
      expect(cancelOnlyTask).toBeDefined();
      const items = getItems({
        ...cancelOnlyTask,
        canEdit: cancelOnlyTask.can_edit,
      });
      const cancelItem = items.find(
        i => i.title && i.title.toLowerCase().includes('cancel')
      );
      expect(cancelItem).toBeDefined();
    });

    it('returns no actions when user cannot edit', () => {
      const setClickedTask = jest.fn();
      const openModal = jest.fn();
      const getItems = getRowKebabItems(setClickedTask, openModal);
      const task = { ...results[0], can_edit: false };
      const items = getItems({ ...task, canEdit: false });
      expect(items).toEqual([]);
    });
  });
});
