import { combineReducers } from 'redux';
import { reducers as tasksDashboardReducers } from './Components/TasksDashboard';

const reducers = {
  foremanTasks: combineReducers({
    ...tasksDashboardReducers,
  }),
};

export default reducers;
