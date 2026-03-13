import { convertDashboardQuery } from './TaskActionHelpers';

let realDate;

describe('convertDashboardQuery', () => {
  const mockLocation = query => {
    global.window = Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/foreman_tasks/tasks',
        search: query,
      },
      writable: true,
    });
  };
  it('convertDashboardQuery should work with full query', () => {
    const currentDate = new Date('2020-05-08T11:01:58.135Z');
    realDate = Date;
    global.Date = class extends Date {
      constructor(date) {
        if (date) {
          // eslint-disable-next-line constructor-super
          return super(date);
        }
        return currentDate;
      }
    };
    mockLocation('?state=stopped&result=error&search=action~job');
    const expected = '(state=stopped) and (result=error) and (action~job)';

    expect(convertDashboardQuery()).toEqual({ search: expected });

    mockLocation('?state=stopped&result=error&search=action~job');
    const expected2 = '(state=stopped) and (result=error) and (action~job)';
    expect(convertDashboardQuery()).toEqual({ search: expected2 });
    global.Date = realDate;
  });
  it('convertDashboardQuery should work with only search query', () => {
    mockLocation('?search=action~job');
    expect(convertDashboardQuery()).toEqual({ search: '(action~job)' });
  });
  it('convertDashboardQuery should work with no query', () => {
    mockLocation('');
    expect(convertDashboardQuery()).toEqual({});
  });
  it('convertDashboardQuery should not override unknown keys', () => {
    const query = { weather: 'nice', search: 'okay', number: '7' };
    mockLocation('?weather=nice&search=okay&number=7');
    expect(convertDashboardQuery()).toEqual({
      ...query,
      search: '(okay)',
    });
  });
  it('convertDashboardQuery should expand other result', () => {
    mockLocation('?result=other');
    expect(convertDashboardQuery()).toEqual({
      search: '(result ^ (pending, cancelled))',
    });
  });
});
