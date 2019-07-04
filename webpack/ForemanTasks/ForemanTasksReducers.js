import { combineReducers } from 'redux';
import { reducers as tasksDashboardReducers } from './Components/TasksDashboard';
import { reducers as tasksTableReducers } from './Components/TasksTable';

const reducers = {
  foremanTasks: combineReducers({
    ...tasksDashboardReducers,
    ...tasksTableReducers,
  }),
};

export default reducers;
