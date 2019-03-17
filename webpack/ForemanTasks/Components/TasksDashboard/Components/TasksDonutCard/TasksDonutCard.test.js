import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import { TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS_ARRAY } from '../TasksDonutChart/TasksDonutChartConstants';
import TasksDonutCard from './TasksDonutCard';

const createRequiredProps = () => ({ last: 3, older: 5 });

const fixtures = {
  'render with minimal props': { ...createRequiredProps() },
  'render with props': {
    ...createRequiredProps(),
    title: 'some title',
    className: 'some-classname',
    focusedOn: 'normal',
    onTotalClick: jest.fn(),
  },
};

TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS_ARRAY.forEach(mode => {
  fixtures[`render with focused-on ${mode}`] = {
    ...createRequiredProps(),
    focusedOn: mode,
  };
});

describe('TasksDonutCard', () =>
  testComponentSnapshotsWithFixtures(TasksDonutCard, fixtures));
