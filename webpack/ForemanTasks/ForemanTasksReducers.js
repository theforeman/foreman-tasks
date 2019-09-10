import { combineReducers } from 'redux';
import { reducers as tasksDashboardReducers } from './Components/TasksDashboard';
import { reducers as taskDetailsReducers } from './Components/TaskDetails';

const reducers = {
  foremanTasks: combineReducers({
    ...tasksDashboardReducers,
    ...taskDetailsReducers,
  }),
};

export default reducers;
