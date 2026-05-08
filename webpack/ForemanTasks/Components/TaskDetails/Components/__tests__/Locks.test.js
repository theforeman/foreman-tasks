import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Locks from '../Locks';

describe('Locks', () => {
  it('renders the locks explainer and empty gallery when there are no locks', () => {
    render(<Locks locks={[]} />);
    expect(
      screen.getByText(/you can find resource locks on this page/i)
    ).toBeInTheDocument();
  });

  it('renders a card for each lock', () => {
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
    expect(screen.getAllByText('User')).toHaveLength(2);
    expect(screen.getByText('id:4')).toBeInTheDocument();
    expect(screen.getByText('id:2')).toBeInTheDocument();
  });
});
