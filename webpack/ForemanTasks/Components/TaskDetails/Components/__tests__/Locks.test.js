import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Locks from '../Locks';

describe('Locks', () => {
  it('renders empty state when there are no locks', () => {
    const { container } = render(<Locks locks={[]} />);
    expect(
      screen.getByRole('heading', { name: /no resources/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /no resources currently associated with this task/i
      )
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-ouia-component-id="task-locks-empty"]')
    ).toBeInTheDocument();
  });

  it('renders non-exclusive section with rows when there are only non-exclusive locks', () => {
    render(
      <Locks
        locks={[
          {
            name: 'task_owner',
            exclusive: false,
            resource_type: 'User',
            resource_id: 4,
            link: null,
          },
          {
            name: 'task_owner2',
            exclusive: false,
            resource_type: 'User',
            resource_id: 2,
            link: null,
          },
        ]}
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Non-exclusive resources' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /other tasks can access the resource simultaneously/i
      )
    ).toBeInTheDocument();
    expect(screen.getAllByText('User')).toHaveLength(2);
    expect(screen.getByText('id: 4')).toBeInTheDocument();
    expect(screen.getByText('id: 2')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Exclusive resources' })
    ).not.toBeInTheDocument();
  });

  it('renders exclusive section when there are only exclusive locks', () => {
    render(
      <Locks
        locks={[
          {
            name: 'host_lock',
            exclusive: true,
            resource_type: 'Host',
            resource_id: 1,
            link: '/hosts/1',
          },
        ]}
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Exclusive resources' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /only this task can access the resource/i
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Host' })).toHaveAttribute(
      'href',
      '/hosts/1'
    );
    expect(screen.getByText('id: 1')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Non-exclusive resources' })
    ).not.toBeInTheDocument();
  });

  it('renders both sections when locks are mixed', () => {
    render(
      <Locks
        locks={[
          {
            name: 'a',
            exclusive: false,
            resource_type: 'Smart proxy',
            resource_id: 7,
            link: null,
          },
          {
            name: 'b',
            exclusive: true,
            resource_type: 'Host managed',
            resource_id: 1,
            link: null,
          },
        ]}
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Non-exclusive resources' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Exclusive resources' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /other tasks can access the resource simultaneously/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/only this task can access the resource/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Smart proxy')).toBeInTheDocument();
    expect(screen.getByText('Host managed')).toBeInTheDocument();
    expect(screen.getByText('id: 7')).toBeInTheDocument();
    expect(screen.getByText('id: 1')).toBeInTheDocument();
  });

  it('renders a link for non-exclusive locks when lock.link is set', () => {
    render(
      <Locks
        locks={[
          {
            name: 'proxy',
            exclusive: false,
            resource_type: 'Smart proxy',
            resource_id: 7,
            link: '/smart_proxies/7',
          },
        ]}
      />
    );
    const link = screen.getByRole('link', { name: 'Smart proxy' });
    expect(link).toHaveAttribute('href', '/smart_proxies/7');
  });

  it('formats string resource_id values in the row label', () => {
    render(
      <Locks
        locks={[
          {
            name: 'x',
            exclusive: false,
            resource_type: 'Custom',
            resource_id: 'uuid-abc',
            link: null,
          },
        ]}
      />
    );
    expect(screen.getByText('id: uuid-abc')).toBeInTheDocument();
  });

  it('sets ouia ids on populated container and lock rows', () => {
    const { container } = render(
      <Locks
        locks={[
          {
            name: 'ne',
            exclusive: false,
            resource_type: 'A',
            resource_id: 1,
            link: null,
          },
          {
            name: 'ex',
            exclusive: true,
            resource_type: 'B',
            resource_id: 2,
            link: null,
          },
        ]}
      />
    );
    expect(
      container.querySelector('[data-ouia-component-id="task-locks-populated"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        '[data-ouia-component-id="task-locks-non-exclusive-row-0"]'
      )
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        '[data-ouia-component-id="task-locks-exclusive-row-0"]'
      )
    ).toBeInTheDocument();
  });
});
