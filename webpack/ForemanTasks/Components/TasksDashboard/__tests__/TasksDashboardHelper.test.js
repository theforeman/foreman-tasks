import {
  getQueryKeyText,
  getQueryValueText,
  timeToHoursNumber,
} from '../TasksDashboardHelper';
import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_QUERY_KEYS_TEXT,
  TASKS_DASHBOARD_QUERY_VALUES_TEXT,
} from '../TasksDashboardConstants';

const { H12, H24, WEEK } = TASKS_DASHBOARD_AVAILABLE_TIMES;

describe('TasksDashboard - helpers', () => {
  it('should getQueryKeyText', () => {
    Object.entries(TASKS_DASHBOARD_QUERY_KEYS_TEXT).forEach(([key, value]) => {
      expect(getQueryKeyText(key)).toBe(value);
    });
  });

  it('should getQueryValueText', () => {
    Object.entries(TASKS_DASHBOARD_QUERY_VALUES_TEXT).forEach(
      ([key, value]) => {
        expect(getQueryValueText(key)).toBe(value);
      }
    );
  });

  it('should timeToHoursNumber', () => {
    expect(timeToHoursNumber(H12)).toBe(12);
    expect(timeToHoursNumber(H24)).toBe(24);
    expect(timeToHoursNumber(WEEK)).toBe(7 * 24);

    expect(timeToHoursNumber('other')).toBe(24);
  });
});
