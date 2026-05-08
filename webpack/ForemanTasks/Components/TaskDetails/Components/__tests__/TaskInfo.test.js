import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('foremanReact/components/common/dates/RelativeDateTime', () => {
  const React = require('react');
  const RelativeDateTime = ({ date, defaultValue }) => (
    <span>{date || defaultValue}</span>
  );
  return RelativeDateTime;
});

import TaskInfo from '../TaskInfo';

describe('TaskInfo', () => {
  it('renders default metadata labels when given minimal props', () => {
    render(<TaskInfo id="test" />);
    expect(screen.getByText(/name:/i)).toBeInTheDocument();
    expect(screen.getByText(/start at:/i)).toBeInTheDocument();
    expect(screen.getByText(/result:/i)).toBeInTheDocument();
  });

  it('renders task fields and troubleshooting when full props are provided', () => {
    render(
      <TaskInfo
        id="test"
        startAt="2019-06-17 16:04:09 +0300"
        label="Actions::Katello::EventQueue::Monitor"
        action="Monitor Event Queue"
        username="admin"
        startedAt="2019-06-17 16:04:09 +0300"
        endedAt={null}
        state="paused"
        result="error"
        progress={0.5}
        help={
          "A paused task represents a process that has not finished properly. Any task in paused state can lead to potential inconsistency and needs to be resolved.\nThe recommended approach is to investigate the error messages below and in 'errors' tab, address the primary cause of the issue and resume the task."
        }
        output={{}}
        usernamePath=""
      />
    );
    expect(screen.getByText('Monitor Event Queue')).toBeInTheDocument();
    expect(screen.getByText(/troubleshooting/i)).toBeInTheDocument();
    expect(
      screen.getByText(/a paused task represents a process/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/^paused$/)).toBeInTheDocument();
    expect(screen.getByText(/^error$/)).toBeInTheDocument();
  });
});
