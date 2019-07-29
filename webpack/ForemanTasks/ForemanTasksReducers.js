import { combineReducers } from 'redux';
import { reducers as tasksDashboardReducers } from './Components/TasksDashboard';
import { reducers as taskDetailsReducers } from './Components/TaskDetails';
import { reducers as tasksTableReducers } from './Components/TasksTable';

const reducers = {
  foremanTasks: combineReducers({
    ...tasksDashboardReducers,
    ...taskDetailsReducers,
    ...tasksTableReducers,
  }),
};

export default reducers;
