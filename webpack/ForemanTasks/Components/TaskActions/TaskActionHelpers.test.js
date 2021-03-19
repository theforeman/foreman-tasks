import { convertDashboardQuery } from './TaskActionHelpers';
import {
  TASKS_DASHBOARD_JS_QUERY_MODES,
  TASKS_DASHBOARD_AVAILABLE_TIMES,
} from '../TasksDashboard/TasksDashboardConstants';

let realDate;

describe('convertDashboardQuery', () => {
  it('convertDashboardQuery should work with full query', () => {
    // Setup
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
    const query = {
      time_mode: TASKS_DASHBOARD_JS_QUERY_MODES.RECENT,
      time_horizon: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
      state: 'stopped',
      result: 'error',
      search: 'action~job',
    };
    const expected =
      '(state=stopped) and (result=error) and (action~job) and (state_updated_at>2020-05-01T11:01:58.135Z or state_updated_at = NULL)';

    expect(convertDashboardQuery(query)).toEqual({ search: expected });
    // Cleanup
    global.Date = realDate;
  });
  it('convertDashboardQuery should work with only search query', () => {
    const query = {
      search: 'action~job',
    };
    expect(convertDashboardQuery(query)).toEqual({ search: '(action~job)' });
  });
  it('convertDashboardQuery should work with no query', () => {
    const query = {};
    expect(convertDashboardQuery(query)).toEqual({});
  });
  it('convertDashboardQuery should not override unknown keys', () => {
    const query = { weather: 'nice', search: 'okay', number: 7 };
    expect(convertDashboardQuery(query)).toEqual({
      ...query,
      search: '(okay)',
    });
  });
  it('convertDashboardQuery should expand other result', () => {
    const query = { result: 'other' };
    expect(convertDashboardQuery(query)).toEqual({
      search: '(result ^ (pending, cancelled))',
    });
  });
});
