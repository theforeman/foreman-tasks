import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Raw from '../Raw';

describe('Raw', () => {
  it('renders id and label when minimal props are given', () => {
    render(
      <Raw
        id="x"
        label=""
        startedAt=""
        endedAt=""
        input={[]}
        output={{}}
        externalId=""
      />
    );
    expect(screen.getByText('x')).toBeInTheDocument();
  });

  it('renders raw task fields from props', () => {
    render(
      <Raw
        startedAt="2019-06-17 16:04:09 +0300"
        endedAt="2019-06-17 16:05:09 +0300"
        id="6b0d6db2-e9ab-40da-94e5-b6842ac50bd0"
        label="Actions::Katello::EventQueue::Monitor"
        input={{
          locale: 'en',
          current_request_id: 1,
          current_user_id: 4,
          current_organization_id: 2,
          current_location_id: 3,
        }}
        output={{}}
        externalId="test"
      />
    );
    expect(
      screen.getByText('6b0d6db2-e9ab-40da-94e5-b6842ac50bd0')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Actions::Katello::EventQueue::Monitor')
    ).toBeInTheDocument();
    expect(screen.getByText(/"locale":/)).toBeInTheDocument();
  });
});
