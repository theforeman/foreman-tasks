import { combineReducers } from 'redux';
import { reducers as tasksDashboardReducers } from './Components/TasksDashboard';
import { reducers as confirmModalReducers } from './Components/TasksTable/Components/ConfirmModal';

const reducers = {
  foremanTasks: combineReducers({
    ...tasksDashboardReducers,
    ...confirmModalReducers,
  }),
};

export default reducers;
