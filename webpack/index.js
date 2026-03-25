/* eslint import/no-unresolved: [2, { ignore: [foremanReact/*] }] */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
import componentRegistry from 'foremanReact/components/componentRegistry';
import TasksDashboard from './ForemanTasks/Components/TasksDashboard';
import TaskDetails from './ForemanTasks/Components/TaskDetails';

componentRegistry.register({
  name: 'TasksDashboard',
  type: TasksDashboard,
});
componentRegistry.register({
  name: 'TaskDetails',
  type: TaskDetails,
});
