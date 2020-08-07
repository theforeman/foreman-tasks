import { combineReducers } from 'redux';
import { reducers as tasksDashboardReducers } from './Components/TasksDashboard';
import { reducers as tasksTableReducers } from './Components/TasksTable';
import { reducers as confirmModalReducers } from './Components/TasksTable/Components/ConfirmModal';

const reducers = {
  foremanTasks: combineReducers({
    ...tasksDashboardReducers,
    ...tasksTableReducers,
    ...confirmModalReducers,
  }),
};

export default reducers;
