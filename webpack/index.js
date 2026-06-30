/* eslint import/no-unresolved: [2, { ignore: [foremanReact/*] }] */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
import componentRegistry from 'foremanReact/components/componentRegistry';
import TasksDashboard from './ForemanTasks/Components/TasksDashboard';

componentRegistry.register({
  name: 'TasksDashboard',
  type: TasksDashboard,
});
