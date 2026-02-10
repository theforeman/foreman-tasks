import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { OtherInfo } from './OtherInfo';
import {
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS,
} from '../../../../TasksDashboardConstants';

jest.mock('foremanReact/common/I18n', () => ({
  translate: str => str,
}));

const { STOPPED } = TASKS_DASHBOARD_AVAILABLE_QUERY_STATES;
const { OTHER } = TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS;

const defaultProps = {
  updateQuery: jest.fn(),
  otherCount: 7,
  query: { state: STOPPED, result: OTHER },
};

describe('OtherInfo', () => {
  beforeEach(() => {
    defaultProps.updateQuery.mockClear();
  });

  it('renders Other label, count', () => {
    render(<OtherInfo {...defaultProps} />);
    expect(screen.getByText('Other:')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('calls updateQuery with STOPPED and OTHER when the count button is clicked', () => {
    render(<OtherInfo {...defaultProps} />);
    const button = screen.getByRole('button', { name: '7' });
    fireEvent.click(button);
    expect(defaultProps.updateQuery).toHaveBeenCalledWith({
      state: STOPPED,
      result: OTHER,
    });
  });

  it('applies other-active class when query state is STOPPED and result is OTHER', () => {
    const { container } = render(
      <OtherInfo {...defaultProps} query={{ state: STOPPED, result: OTHER }} />
    );
    const wrapper = container.querySelector('.other-active');
    expect(wrapper).toBeInTheDocument();
  });

  it('does not apply other-active class when query result is not OTHER', () => {
    const { container } = render(
      <OtherInfo
        {...defaultProps}
        query={{ state: STOPPED, result: 'error' }}
      />
    );
    const wrapper = container.querySelector('.other-active');
    expect(wrapper).not.toBeInTheDocument();
  });
});
