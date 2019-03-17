import {
  selectAutocomplete,
  selectAutocompleteSearchQuery,
} from 'foremanReact/components/AutoComplete/AutoCompleteSelectors';
import { selectForemanTasks } from '../../ForemanTasksSelectors';
import {
  TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS,
  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES,
} from './TasksDashboardConstants';
import {
  searchQueryIncludes,
  createSearchQueryByType,
} from './TasksDashboardHelper';

export const selectTasksDashboard = state =>
  selectForemanTasks(state).tasksDashboard || {};

export const selectTimePeriod = state =>
  selectTasksDashboard(state).timePeriod ||
  TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS.H24;

const selectSearchQueryIncludes = (state, searchQuery) =>
  selectAutocomplete(state) &&
  searchQueryIncludes(selectAutocompleteSearchQuery(state), searchQuery);

const selectIsSelectedByType = (state, type) =>
  selectSearchQueryIncludes(
    state,
    createSearchQueryByType(type, selectTimePeriod(state))
  );

export const selectIsRunningSelected = state =>
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.RUNNING
  );

export const selectIsPausedSelected = state =>
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.PAUSED
  );

export const selectIsStoppedSelected = state =>
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.STOPPED
  );

export const selectIsScheduledSelected = state =>
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.SCHEDULED
  );

export const selectIsRunningLastSelected = state =>
  selectIsRunningSelected(state) &&
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.LAST
  );

export const selectIsRunningOverSelected = state =>
  selectIsRunningSelected(state) &&
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.OVER
  );

export const selectIsPausedLastSelected = state =>
  selectIsPausedSelected(state) &&
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.LAST
  );

export const selectIsPausedOverSelected = state =>
  selectIsPausedSelected(state) &&
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.OVER
  );

export const selectIsStoppedErrorSelected = state =>
  selectIsStoppedSelected(state) &&
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.ERROR
  ) &&
  !selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.LAST
  );

export const selectIsStoppedWarningSelected = state =>
  selectIsStoppedSelected(state) &&
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.WARNING
  ) &&
  !selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.LAST
  );

export const selectIsStoppedSuccessSelected = state =>
  selectIsStoppedSelected(state) &&
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.SUCCESS
  ) &&
  !selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.LAST
  );

export const selectIsStoppedErrorLastSelected = state =>
  selectIsStoppedSelected(state) &&
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.ERROR
  ) &&
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.LAST
  );

export const selectIsStoppedWarningLastSelected = state =>
  selectIsStoppedSelected(state) &&
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.WARNING
  ) &&
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.LAST
  );

export const selectIsStoppedSuccessLastSelected = state =>
  selectIsStoppedSelected(state) &&
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.SUCCESS
  ) &&
  selectIsSelectedByType(
    state,
    TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.LAST
  );
