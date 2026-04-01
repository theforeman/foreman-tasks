import React from 'react';
import {
  screen,
  within,
  fireEvent,
  waitFor,
  render,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';

import { rtlHelpers } from 'foremanReact/common/testHelpers';

import TasksTableIndexPage from '../TasksIndexPage';
import { CellActionButton } from '../Components/CellActionButton';
import { RESUME_MODAL, FORCE_UNLOCK_MODAL } from '../TasksTableConstants';
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

jest.mock('foremanReact/Root/Context/ForemanContext', () => ({
  ...jest.requireActual('foremanReact/Root/Context/ForemanContext'),
  useForemanPermissions: () => new Set(['edit_foreman_tasks']),
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

    const clickRowActionButton = (rowActionLabel, buttonName) => {
      const row = screen
        .getByRole('link', { name: rowActionLabel })
        .closest('tr');
      const rowScope = within(row);
      fireEvent.click(rowScope.getByRole('button', { name: buttonName }));
    };

    const openResumeModal = async () => {
      clickRowActionButton(resumableTask.action, 'Resume');
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Resume Task' })
        ).toBeInTheDocument();
      });
    };

    const openCancelModal = async () => {
      clickRowActionButton(cancelOnlyTask.action, 'Cancel');
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Cancel Task' })
        ).toBeInTheDocument();
      });
    };

    const openForceUnlockModal = async () => {
      clickRowActionButton(forceCancelTask.action, 'Force Cancel');
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Force Unlock Task' })
        ).toBeInTheDocument();
      });
    };

    beforeEach(() => {
      mockApiPost.mockClear();
    });

    it('opens Resume modal when Resume row action button is clicked', async () => {
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

describe('CellActionButton', () => {
  const setClickedTask = jest.fn();
  const openModal = jest.fn();

  const renderCellActionButton = (props = {}) =>
    render(
      <IntlProvider locale="en">
        <CellActionButton
          id="task-id-1"
          action="Fixture action"
          canEdit
          setClickedTask={setClickedTask}
          openModal={openModal}
          {...props}
        />
      </IntlProvider>
    );

  beforeEach(() => {
    setClickedTask.mockClear();
    openModal.mockClear();
  });

  it('renders Resume for a resumable task when user can edit and opens resume modal on click', () => {
    renderCellActionButton({
      resumable: true,
      cancellable: false,
      stoppable: false,
    });
    const resumeBtn = screen.getByRole('button', { name: 'Resume' });
    expect(resumeBtn).toBeInTheDocument();
    fireEvent.click(resumeBtn);
    expect(setClickedTask).toHaveBeenCalledWith({
      id: 'task-id-1',
      action: 'Fixture action',
    });
    expect(openModal).toHaveBeenCalledWith(RESUME_MODAL);
  });

  it('renders Cancel for cancellable non-resumable task when user can edit', () => {
    renderCellActionButton({
      cancellable: true,
      resumable: false,
      stoppable: false,
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders no action buttons when user cannot edit', () => {
    renderCellActionButton({
      canEdit: false,
      resumable: true,
      cancellable: true,
      stoppable: true,
    });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders disabled cancel button when no action is available', () => {
    renderCellActionButton({
      resumable: false,
      cancellable: false,
      stoppable: false,
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('renders Force Cancel when task is stoppable and opens force unlock modal on click', () => {
    renderCellActionButton({
      resumable: false,
      cancellable: false,
      stoppable: true,
    });
    const forceBtn = screen.getByRole('button', { name: 'Force Cancel' });
    expect(forceBtn).toBeInTheDocument();
    fireEvent.click(forceBtn);
    expect(setClickedTask).toHaveBeenCalledWith({
      id: 'task-id-1',
      action: 'Fixture action',
    });
    expect(openModal).toHaveBeenCalledWith(FORCE_UNLOCK_MODAL);
  });
});
