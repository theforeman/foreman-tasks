import { registerRoutes } from 'foremanReact/routes/RoutingService';
import { registerReducer } from 'foremanReact/common/MountingService';
import routes from './Routes/routes';
import reducers from './ForemanTasks/ForemanTasksReducers';

Object.entries(reducers).forEach(([key, reducer]) =>
  registerReducer(key, reducer)
);

registerRoutes('foreman_tasks', routes);
