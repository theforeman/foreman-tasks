import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import { TASKS_DASHBOARD_AVAILABLE_TIMES } from '../../../../TasksDashboardConstants';
import TimeDropDown from './TimeDropDown';

const createRequiredProps = () => ({ id: 'some-id' });

const fixtures = {
  'render with minimal props': { ...createRequiredProps() },
  'render with all props': {
    ...createRequiredProps(),
    className: 'some-class',
    selectedTime: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
    onChange: jest.fn(),
  },
};

describe('TimeDropDown', () =>
  testComponentSnapshotsWithFixtures(TimeDropDown, fixtures));

describe('TimeDropDown interactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls onChange when a different time option is selected', async () => {
    const onChange = jest.fn();

    render(
      <TimeDropDown
        id="time-dropdown"
        selectedTime={TASKS_DASHBOARD_AVAILABLE_TIMES.H24}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /24h/i }));

    const menu = await screen.findByRole('menu');
    fireEvent.click(within(menu).getByRole('menuitem', { name: /^12h$/i }));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        TASKS_DASHBOARD_AVAILABLE_TIMES.H12
      );
    });
  });

  it('does not call onChange when the already-selected option is clicked', async () => {
    const onChange = jest.fn();

    render(
      <TimeDropDown
        id="time-dropdown"
        selectedTime={TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^week$/i }));

    const menu = await screen.findByRole('menu');
    fireEvent.click(within(menu).getByRole('menuitem', { name: /^week$/i }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
