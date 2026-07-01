import {
  durationInWords,
  formatTaskDuration,
  isDelayed,
  parseUsernameLinkHref,
} from '../TaskHelper';

describe('durationInWords', () => {
  it('should work for seconds', () => {
    expect(durationInWords('1/1/1 10:00:00', '1/1/1 10:00:01')).toEqual({
      text: '1 second',
      tooltip: '1 seconds',
    });
  });
  it('should work for minutes', () => {
    expect(durationInWords('1/1/1 10:00:00', '1/1/1 10:02:01')).toEqual({
      text: '2 minutes',
      tooltip: '121 seconds',
    });
  });
  it('should work for hours', () => {
    expect(durationInWords('1/1/1 10:00:00', '1/1/1 13:00:01')).toEqual({
      text: '3 hours',
      tooltip: '10,801 seconds',
    });
  });
});

describe('isDelayed', () => {
  it('returns false when startAt is missing', () => {
    expect(isDelayed({ startAt: null, startedAt: '2020-01-02' })).toBe(false);
    expect(isDelayed({ startAt: '', startedAt: '2020-01-02' })).toBe(false);
    expect(isDelayed({ startedAt: '2020-01-02' })).toBe(false);
  });

  it('returns false when startedAt is missing', () => {
    expect(isDelayed({ startAt: '2020-01-01', startedAt: null })).toBe(false);
    expect(isDelayed({ startAt: '2020-01-01', startedAt: '' })).toBe(false);
    expect(isDelayed({ startAt: '2020-01-01' })).toBe(false);
  });

  it('returns false when either date is invalid', () => {
    expect(
      isDelayed({ startAt: 'not-a-date', startedAt: '2020-01-02' })
    ).toBe(false);
    expect(
      isDelayed({ startAt: '2020-01-01', startedAt: 'not-a-date' })
    ).toBe(false);
  });

  it('returns false when startAt and startedAt are the same instant', () => {
    expect(
      isDelayed({ startAt: '2020-01-01T10:00:00', startedAt: '2020-01-01T10:00:00' })
    ).toBe(false);
  });

  it('ignores millisecond differences when comparing startAt and startedAt', () => {
    expect(
      isDelayed({
        startAt: '2020-01-01T10:00:00.123',
        startedAt: '2020-01-01T10:00:00.456',
      })
    ).toBe(false);
  });

  it('returns true when startAt and startedAt differ', () => {
    expect(
      isDelayed({ startAt: '2020-01-01', startedAt: '2020-01-02' })
    ).toBe(true);
  });
});

describe('parseUsernameLinkHref', () => {
  it('returns null for empty or non-string input', () => {
    expect(parseUsernameLinkHref(null)).toBeNull();
    expect(parseUsernameLinkHref(undefined)).toBeNull();
    expect(parseUsernameLinkHref('')).toBeNull();
    expect(parseUsernameLinkHref(123)).toBeNull();
  });

  it('extracts href from double-quoted attribute values', () => {
    expect(
      parseUsernameLinkHref('<a href="/users/bob">Bob</a>')
    ).toBe('/users/bob');
  });

  it('extracts href from single-quoted attribute values', () => {
    expect(
      parseUsernameLinkHref("<a href='/users/bob'>Bob</a>")
    ).toBe('/users/bob');
  });

  it('returns null when no href attribute is present', () => {
    expect(parseUsernameLinkHref('<a>Bob</a>')).toBeNull();
  });
});

describe('formatTaskDuration', () => {
  it('returns N/A when the task is not stopped', () => {
    expect(
      formatTaskDuration('2020-01-01T10:00:00', '2020-01-01T10:00:01', 'running')
    ).toBe('N/A');
  });

  it('returns N/A when start or end time is missing', () => {
    expect(formatTaskDuration('', '2020-01-01T10:00:01', 'stopped')).toBe(
      'N/A'
    );
    expect(formatTaskDuration('2020-01-01T10:00:00', '', 'stopped')).toBe(
      'N/A'
    );
  });

  it('returns N/A when dates are invalid or end precedes start', () => {
    expect(
      formatTaskDuration('not-a-date', '2020-01-01T10:00:01', 'stopped')
    ).toBe('N/A');
    expect(
      formatTaskDuration('2020-01-01T10:00:00', 'not-a-date', 'stopped')
    ).toBe('N/A');
    expect(
      formatTaskDuration(
        '2020-01-01T10:00:01',
        '2020-01-01T10:00:00',
        'stopped'
      )
    ).toBe('N/A');
  });

  it('returns a humanized duration for stopped tasks with valid timestamps', () => {
    expect(
      formatTaskDuration(
        '1/1/1 10:00:00',
        '1/1/1 10:00:01',
        'stopped'
      )
    ).toBe('1 second');
  });
});
