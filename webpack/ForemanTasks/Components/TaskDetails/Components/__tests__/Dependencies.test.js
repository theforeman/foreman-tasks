import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import Dependencies from '../Dependencies';

describe('Dependencies', () => {
  it('renders info alert and None for both tables when there are no tasks', () => {
    render(<Dependencies dependsOn={[]} blocks={[]} />);
    expect(
      screen.getByRole('heading', { name: /task dependencies/i })
    ).toBeInTheDocument();
    const noneLabels = screen.getAllByText(/^none$/i);
    expect(noneLabels.length).toBeGreaterThanOrEqual(2);
  });

  it('renders depends_on tasks in the first table', () => {
    const dependsOn = [
      {
        id: '123',
        action: 'Actions::FooBar',
        humanized: 'Foo Bar Action',
        state: 'stopped',
        result: 'success',
      },
      {
        id: '456',
        action: 'Actions::BazQux',
        humanized: 'Baz Qux Action',
        state: 'running',
        result: 'pending',
      },
    ];
    render(<Dependencies dependsOn={dependsOn} blocks={[]} />);
    const table = screen.getByRole('grid', { name: /depends on/i });
    expect(within(table).getByText('Foo Bar Action')).toBeInTheDocument();
    expect(within(table).getByText('Baz Qux Action')).toBeInTheDocument();
    expect(within(table).getByText('stopped')).toBeInTheDocument();
    expect(within(table).getByText('success')).toBeInTheDocument();
  });

  it('renders blocks in the second table', () => {
    const blocks = [
      {
        id: '789',
        action: 'Actions::Test',
        humanized: 'Test Action',
        state: 'paused',
        result: 'warning',
      },
    ];
    render(<Dependencies dependsOn={[]} blocks={blocks} />);
    const table = screen.getByRole('grid', { name: /^blocks$/i });
    expect(within(table).getByText('Test Action')).toBeInTheDocument();
    expect(within(table).getByText('paused')).toBeInTheDocument();
    expect(within(table).getByText('warning')).toBeInTheDocument();
  });

  it('renders both tables when dependsOn and blocks are present', () => {
    const dependsOn = [
      {
        id: '123',
        action: 'Actions::Foo',
        humanized: 'Foo Action',
        state: 'stopped',
        result: 'success',
      },
    ];
    const blocks = [
      {
        id: '456',
        action: 'Actions::Bar',
        humanized: 'Bar Action',
        state: 'running',
        result: 'pending',
      },
      {
        id: '789',
        action: 'Actions::Baz',
        humanized: 'Baz Action',
        state: 'stopped',
        result: 'error',
      },
    ];
    render(<Dependencies dependsOn={dependsOn} blocks={blocks} />);
    expect(screen.getByRole('grid', { name: /depends on/i })).toBeInTheDocument();
    expect(screen.getByText('Foo Action')).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: /^blocks$/i })).toBeInTheDocument();
    expect(screen.getByText('Bar Action')).toBeInTheDocument();
    expect(screen.getByText('Baz Action')).toBeInTheDocument();
  });
});
