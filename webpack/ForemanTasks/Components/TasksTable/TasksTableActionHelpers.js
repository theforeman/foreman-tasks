import { translate as __, sprintf } from 'foremanReact/common/I18n';
import { addToast } from 'foremanReact/redux/actions/toasts';
import { TASKS_DASHBOARD_AVAILABLE_QUERY_MODES } from '../TasksDashboard/TasksDashboardConstants';
import { timeToHoursNumber } from '../TasksDashboard/TasksDashboardHelper';

export const convertDashboardQuery = query => {
  const {
    time_mode: timeMode,
    time_horizon: timeHorizon,
    state,
    result,
    search,
  } = query;

  const hours = timeToHoursNumber(timeHorizon);

  const timestamp = new Date(new Date() - hours * 60 * 60 * 1000);
  let dashboardTime = '';
  const stateQuery = state ? `state=${state}` : '';
  const resultQuery = result ? `result=${result}` : '';
  if (timeMode === TASKS_DASHBOARD_AVAILABLE_QUERY_MODES.LAST) {
    dashboardTime = `(state_updated_at<${timestamp.toISOString()} or state_updated_at = NULL)`;
  } else if (timeMode === TASKS_DASHBOARD_AVAILABLE_QUERY_MODES.OLDER) {
    dashboardTime = `(state_updated_at>${timestamp.toISOString()})`;
  }
  const newQuery = [stateQuery, resultQuery, search, dashboardTime]
    .filter(Boolean)
    .join(' and ');
  return newQuery;
};

export const resumeToastInfo = {
  resumed: { type: 'success', text: __('was resumed') },
  failed: { type: 'error', text: __('could not be resumed') },
  skipped: { type: 'warning', text: __('task has to be resumable') },
};

export const cancelToastInfo = {
  cancelled: { type: 'success', text: __('was cancelled') },
  skipped: { type: 'warning', text: __('task has to be cancellable') },
};

export const toastDispatch = ({ type, name, toastInfo, dispatch }) => {
  dispatch(
    addToast({
      type: toastInfo[type].type,
      message: sprintf('%(name)s Task execution %(type)s', {
        name,
        type: toastInfo[type].text,
      }),
    })
  );
};
