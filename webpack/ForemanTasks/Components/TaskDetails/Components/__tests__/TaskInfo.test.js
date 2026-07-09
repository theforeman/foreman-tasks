import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('foremanReact/components/common/dates/RelativeDateTime', () => {
  const RelativeDateTime = ({ date, defaultValue }) => (
    <span>{date || defaultValue}</span>
  );
  return RelativeDateTime;
});

import TaskInfo from '../TaskInfo';
import { durationInWords } from '../TaskHelper';

describe('TaskInfo', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders overview metadata headings for minimal props', () => {
    render(<TaskInfo id="tid" />);

    expect(screen.getByText('Result')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
    expect(screen.getByText('Started at')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Triggered by')).toBeInTheDocument();
    expect(screen.getByText('Id')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /show more details/i })
    ).toBeInTheDocument();
    expect(screen.getByText('tid')).toBeInTheDocument();
    expect(screen.getByText(/^Error$/)).toBeInTheDocument();
  });

  it('shows progress only while task state is not stopped', () => {
    const props = {
      id: 'r1',
      state: 'running',
      result: 'pending',
      progress: 42,
      startedAt: '',
      usernamePath: '',
    };

    const { rerender } = render(<TaskInfo {...props} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '42'
    );

    rerender(<TaskInfo {...props} state="stopped" />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('expands to show label, execution type, start at, ended at, and external id', async () => {
    render(
      <TaskInfo
        id="tid"
        label="Actions::Katello::EventQueue::Monitor"
        action="Monitor Event Queue"
        externalId="ext-42"
        startAt="2019-06-17 16:04:09 +0300"
        startedAt="2019-06-17 16:04:09 +0300"
        endedAt=""
        state="paused"
        result="error"
        progress={1}
        username="admin"
        usernamePath=""
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: /show more details/i })
    );

    expect(screen.getByText('Execution type')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('Start at')).toBeInTheDocument();
    expect(screen.getByText('Ended at')).toBeInTheDocument();
    expect(screen.getByText('External Id')).toBeInTheDocument();
    expect(
      screen.getByText('Actions::Katello::EventQueue::Monitor')
    ).toBeInTheDocument();
    expect(screen.getByText('ext-42')).toBeInTheDocument();
    expect(screen.getByText(/^Error$/)).toBeInTheDocument();
    expect(screen.getAllByText(/^Paused$/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('1% Complete')).toBeInTheDocument();
  });

  it('reports delayed execution type when startAt and startedAt differ', async () => {
    render(
      <TaskInfo
        id=""
        state="stopped"
        startAt="2020-01-01"
        startedAt="2020-01-02"
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: /show more details/i })
    );

    expect(screen.getByText('Delayed')).toBeInTheDocument();
  });

  it('reports immediate execution type when startAt is missing', async () => {
    render(<TaskInfo id="" state="stopped" startedAt="2020-01-02" />);

    await userEvent.click(
      screen.getByRole('button', { name: /show more details/i })
    );

    expect(screen.getByText('Immediate')).toBeInTheDocument();
  });

  it('renders triggered-by link when usernamePath embeds an href', () => {
    render(
      <TaskInfo
        id=""
        username="bob"
        usernamePath='<a href="/users/bob">Bob</a>'
        state=""
      />
    );

    const link = screen.getByRole('link', { name: 'bob' });
    expect(link).toHaveAttribute('href', '/users/bob');
  });

  it('renders triggered-by link when usernamePath uses single-quoted href', () => {
    render(
      <TaskInfo
        id=""
        username="bob"
        usernamePath="<a href='/users/bob'>Bob</a>"
        state=""
      />
    );

    const link = screen.getByRole('link', { name: 'bob' });
    expect(link).toHaveAttribute('href', '/users/bob');
  });

  it('formats stop duration when started and ended are valid', () => {
    const startedAt = '2020-01-01T10:00:00.000Z';
    const endedAt = '2020-01-01T10:00:45.000Z';

    render(<TaskInfo id="" state="stopped" startedAt={startedAt} endedAt={endedAt} />);

    expect(
      screen.getByText(durationInWords(startedAt, endedAt).text)
    ).toBeInTheDocument();
  });

  it('shows start before deadline when startBefore is set', async () => {
    render(
      <TaskInfo
        id="tid"
        state="stopped"
        startAt="2020-01-01"
        startBefore="2020-01-05"
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: /show more details/i })
    );

    expect(screen.getByText('2020-01-01')).toBeInTheDocument();
    expect(screen.getByText(/before/i)).toBeInTheDocument();
    expect(screen.getByText('2020-01-05')).toBeInTheDocument();
  });

  it('does not show start before text when startBefore is missing', async () => {
    render(<TaskInfo id="tid" state="stopped" startAt="2020-01-01" />);

    await userEvent.click(
      screen.getByRole('button', { name: /show more details/i })
    );

    expect(screen.getByText('2020-01-01')).toBeInTheDocument();
    expect(screen.queryByText(/before/i)).not.toBeInTheDocument();
  });

  it('shows troubleshooting help when expanded and help is provided', async () => {
    render(
      <TaskInfo
        id="tid"
        state="paused"
        help="Investigate the error and <a href='/docs'>troubleshooting documentation</a>."
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: /show more details/i })
    );

    expect(screen.getByText('Troubleshooting')).toBeInTheDocument();
    expect(screen.getByText(/Investigate the error/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'troubleshooting documentation' })
    ).toHaveAttribute('href', '/docs');
  });

  it('does not show troubleshooting help when help is empty', async () => {
    render(<TaskInfo id="tid" state="paused" help="" />);

    await userEvent.click(
      screen.getByRole('button', { name: /show more details/i })
    );

    expect(screen.queryByText('Troubleshooting')).not.toBeInTheDocument();
  });
});
