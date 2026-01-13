import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import {
  CancelModal,
  ResumeModal,
  CancelSelectedModal,
  ResumeSelectedModal,
  ForceUnlockModal,
  ForceUnlockSelectedModal,
} from '../index';

// Mock the action creators
jest.mock('../../../TasksTableActions', () => ({
  cancelTask: jest.fn(() => ({ type: 'CANCEL_TASK' })),
  resumeTask: jest.fn(() => ({ type: 'RESUME_TASK' })),
}));

jest.mock('../../../TasksBulkActions', () => ({
  bulkCancelBySearch: jest.fn(() => ({ type: 'BULK_CANCEL_BY_SEARCH' })),
  bulkCancelById: jest.fn(() => ({ type: 'BULK_CANCEL_BY_ID' })),
  bulkResumeBySearch: jest.fn(() => ({ type: 'BULK_RESUME_BY_SEARCH' })),
  bulkResumeById: jest.fn(() => ({ type: 'BULK_RESUME_BY_ID' })),
  bulkForceUnlockBySearch: jest.fn(() => ({
    type: 'BULK_FORCE_UNLOCK_BY_SEARCH',
  })),
  bulkForceUnlockById: jest.fn(() => ({ type: 'BULK_FORCE_UNLOCK_BY_ID' })),
}));

// Mock the selectors
jest.mock('../ConfirmModalSelectors', () => ({
  selectClicked: jest.fn(() => ({ taskId: '123', taskName: 'Test Task' })),
  selectSelectedTasks: jest.fn(() => [
    { id: 1, name: 'Task 1' },
    { id: 2, name: 'Task 2' },
  ]),
  selectSelectedRowsLen: jest.fn(() => 2),
}));

jest.mock('../../../TasksTableSelectors', () => ({
  selectAllRowsSelected: jest.fn(() => false),
}));

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      foremanTasks: (state = initialState, action) => state,
    },
    preloadedState: {
      foremanTasks: initialState,
    },
  });
};

// Test wrapper component
const TestWrapper = ({ children, store }) => (
  <Provider store={store}>{children}</Provider>
);

describe('ConfirmModal Components', () => {
  const defaultProps = {
    isModalOpen: true,
    setIsModalOpen: jest.fn(),
    url: '/api/tasks',
    parentTaskID: 'parent-123',
  };

  const mockStore = createMockStore();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CancelModal', () => {
    it('renders with correct title and content', () => {
      render(
        <TestWrapper store={mockStore}>
          <CancelModal {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Cancel Task')).toBeInTheDocument();
      expect(
        screen.getByText(
          /This will cancel task "Test Task", putting it in the stopped state/
        )
      ).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('calls setIsModalOpen when cancel button is clicked', () => {
      const setIsModalOpen = jest.fn();

      render(
        <TestWrapper store={mockStore}>
          <CancelModal {...defaultProps} setIsModalOpen={setIsModalOpen} />
        </TestWrapper>
      );

      const cancelButton = screen.getByRole('button', { name: 'No' });
      fireEvent.click(cancelButton);

      expect(setIsModalOpen).toHaveBeenCalledWith(false);
    });

    it('calls setIsModalOpen when confirm button is clicked', () => {
      const setIsModalOpen = jest.fn();

      render(
        <TestWrapper store={mockStore}>
          <CancelModal {...defaultProps} setIsModalOpen={setIsModalOpen} />
        </TestWrapper>
      );

      const confirmButton = screen.getByRole('button', { name: 'Yes' });
      fireEvent.click(confirmButton);

      expect(setIsModalOpen).toHaveBeenCalledWith(false);
    });

    it('does not render when isModalOpen is false', () => {
      render(
        <TestWrapper store={mockStore}>
          <CancelModal {...defaultProps} isModalOpen={false} />
        </TestWrapper>
      );

      expect(screen.queryByText('Cancel Task')).not.toBeInTheDocument();
    });
  });

  describe('ResumeModal', () => {
    it('renders with correct title and content', () => {
      render(
        <TestWrapper store={mockStore}>
          <ResumeModal {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Resume Task')).toBeInTheDocument();
      expect(
        screen.getByText(
          /This will resume task "Test Task", putting it in the running state/
        )
      ).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('calls setIsModalOpen when cancel button is clicked', () => {
      const setIsModalOpen = jest.fn();

      render(
        <TestWrapper store={mockStore}>
          <ResumeModal {...defaultProps} setIsModalOpen={setIsModalOpen} />
        </TestWrapper>
      );

      const cancelButton = screen.getByRole('button', { name: 'No' });
      fireEvent.click(cancelButton);

      expect(setIsModalOpen).toHaveBeenCalledWith(false);
    });

    it('calls setIsModalOpen when confirm button is clicked', () => {
      const setIsModalOpen = jest.fn();

      render(
        <TestWrapper store={mockStore}>
          <ResumeModal {...defaultProps} setIsModalOpen={setIsModalOpen} />
        </TestWrapper>
      );

      const confirmButton = screen.getByRole('button', { name: 'Yes' });
      fireEvent.click(confirmButton);

      expect(setIsModalOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('CancelSelectedModal', () => {
    const selectedProps = {
      ...defaultProps,
      uriQuery: { search: 'test' },
    };

    it('renders with correct title and content', () => {
      render(
        <TestWrapper store={mockStore}>
          <CancelSelectedModal {...selectedProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Cancel Selected Tasks')).toBeInTheDocument();
      expect(
        screen.getByText(
          /This will cancel 2 task\(s\), putting them in the stopped state/
        )
      ).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('calls setIsModalOpen when cancel button is clicked', () => {
      const setIsModalOpen = jest.fn();

      render(
        <TestWrapper store={mockStore}>
          <CancelSelectedModal
            {...selectedProps}
            setIsModalOpen={setIsModalOpen}
          />
        </TestWrapper>
      );

      const cancelButton = screen.getByRole('button', { name: 'No' });
      fireEvent.click(cancelButton);

      expect(setIsModalOpen).toHaveBeenCalledWith(false);
    });

    it('calls setIsModalOpen when confirm button is clicked', () => {
      const setIsModalOpen = jest.fn();

      render(
        <TestWrapper store={mockStore}>
          <CancelSelectedModal
            {...selectedProps}
            setIsModalOpen={setIsModalOpen}
          />
        </TestWrapper>
      );

      const confirmButton = screen.getByRole('button', { name: 'Yes' });
      fireEvent.click(confirmButton);

      expect(setIsModalOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('ResumeSelectedModal', () => {
    const selectedProps = {
      ...defaultProps,
      uriQuery: { search: 'test' },
    };

    it('renders with correct title and content', () => {
      render(
        <TestWrapper store={mockStore}>
          <ResumeSelectedModal {...selectedProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Resume Selected Tasks')).toBeInTheDocument();
      expect(
        screen.getByText(
          /This will resume 2 task\(s\), putting them in the running state/
        )
      ).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('calls setIsModalOpen when cancel button is clicked', () => {
      const setIsModalOpen = jest.fn();

      render(
        <TestWrapper store={mockStore}>
          <ResumeSelectedModal
            {...selectedProps}
            setIsModalOpen={setIsModalOpen}
          />
        </TestWrapper>
      );

      const cancelButton = screen.getByRole('button', { name: 'No' });
      fireEvent.click(cancelButton);

      expect(setIsModalOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('ForceUnlockModal', () => {
    it('renders with correct title and content', () => {
      render(
        <TestWrapper store={mockStore}>
          <ForceUnlockModal {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Force Unlock Task')).toBeInTheDocument();
      expect(
        screen.getByText(
          /This will force unlock task "Test Task". This may cause harm and should be used with caution/
        )
      ).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('calls setIsModalOpen when cancel button is clicked', () => {
      const setIsModalOpen = jest.fn();

      render(
        <TestWrapper store={mockStore}>
          <ForceUnlockModal {...defaultProps} setIsModalOpen={setIsModalOpen} />
        </TestWrapper>
      );

      const cancelButton = screen.getByRole('button', { name: 'No' });
      fireEvent.click(cancelButton);

      expect(setIsModalOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('ForceUnlockSelectedModal', () => {
    const selectedProps = {
      ...defaultProps,
      uriQuery: { search: 'test' },
    };

    it('renders with correct title and content', () => {
      render(
        <TestWrapper store={mockStore}>
          <ForceUnlockSelectedModal {...selectedProps} />
        </TestWrapper>
      );

      expect(
        screen.getByText('Force Unlock Selected Tasks')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /This will force unlock 2 task\(s\). This may cause harm and should be used with caution/
        )
      ).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('calls setIsModalOpen when cancel button is clicked', () => {
      const setIsModalOpen = jest.fn();

      render(
        <TestWrapper store={mockStore}>
          <ForceUnlockSelectedModal
            {...selectedProps}
            setIsModalOpen={setIsModalOpen}
          />
        </TestWrapper>
      );

      const cancelButton = screen.getByRole('button', { name: 'No' });
      fireEvent.click(cancelButton);

      expect(setIsModalOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for all modals', () => {
      const { rerender } = render(
        <TestWrapper store={mockStore}>
          <CancelModal {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();

      // Test other modals
      rerender(
        <TestWrapper store={mockStore}>
          <ResumeModal {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    });
  });

  describe('Modal Visibility', () => {
    it('handles modal visibility correctly for all components', () => {
      const { rerender } = render(
        <TestWrapper store={mockStore}>
          <CancelModal {...defaultProps} isModalOpen={false} />
        </TestWrapper>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(
        <TestWrapper store={mockStore}>
          <ResumeModal {...defaultProps} isModalOpen={false} />
        </TestWrapper>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
