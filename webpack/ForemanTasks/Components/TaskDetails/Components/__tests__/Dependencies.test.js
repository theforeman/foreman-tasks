import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import Dependencies from '../Dependencies';

describe('Dependencies', () => {
  it('renders both sections with empty placeholders when there are no tasks', () => {
    render(<Dependencies dependsOn={[]} blocks={[]} />);

    expect(
      screen.getByRole('heading', { name: /task depends on/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /task blocks/i })
    ).toBeInTheDocument();

    expect(screen.getAllByText(/^none$/i)).toHaveLength(2);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('renders depends-on tasks in the first grid', () => {
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

    const dependsGrid = screen.getByRole('grid', {
      name: /task depends on/i,
    });
    expect(screen.queryAllByRole('grid')).toHaveLength(1);

    expect(
      within(dependsGrid).getByRole('columnheader', { name: /^name$/i })
    ).toBeInTheDocument();

    const bodyRows = within(dependsGrid)
      .getAllByRole('row')
      .slice(1);
    expect(bodyRows).toHaveLength(2);

    expect(
      screen.getByRole('link', { name: 'Foo Bar Action' })
    ).toHaveAttribute('href', '/foreman_tasks/tasks/123');
    expect(
      screen.getByRole('link', { name: 'Baz Qux Action' })
    ).toHaveAttribute('href', '/foreman_tasks/tasks/456');

    expect(within(dependsGrid).getByText('Stopped')).toBeInTheDocument();
    expect(within(dependsGrid).getByText('Success')).toBeInTheDocument();
    expect(within(dependsGrid).getByText('Running')).toBeInTheDocument();
    expect(within(dependsGrid).getByText('Pending')).toBeInTheDocument();

    expect(screen.getAllByText(/^none$/i)).toHaveLength(1);
  });

  it('renders blocks in the second grid', () => {
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

    const blocksGrid = screen.getByRole('grid', { name: /task blocks/i });
    expect(screen.queryAllByRole('grid')).toHaveLength(1);

    const bodyRows = within(blocksGrid)
      .getAllByRole('row')
      .slice(1);
    expect(bodyRows).toHaveLength(1);

    expect(screen.getByRole('link', { name: 'Test Action' })).toHaveAttribute(
      'href',
      '/foreman_tasks/tasks/789'
    );
    expect(within(blocksGrid).getByText('Paused')).toBeInTheDocument();
    expect(within(blocksGrid).getByText('Warning')).toBeInTheDocument();

    expect(screen.getAllByText(/^none$/i)).toHaveLength(1);
  });

  it('renders both grids when dependsOn and blocks are present', () => {
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

    expect(
      screen.getByRole('grid', { name: /task depends on/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('grid', { name: /task blocks/i })
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Foo Action' })).toHaveAttribute(
      'href',
      '/foreman_tasks/tasks/123'
    );
    expect(screen.getByRole('link', { name: 'Bar Action' })).toHaveAttribute(
      'href',
      '/foreman_tasks/tasks/456'
    );
    expect(screen.getByRole('link', { name: 'Baz Action' })).toHaveAttribute(
      'href',
      '/foreman_tasks/tasks/789'
    );

    expect(screen.queryByText(/^none$/i)).not.toBeInTheDocument();
  });
});
