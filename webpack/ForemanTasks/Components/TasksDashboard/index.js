import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TasksDashboard from './TasksDashboard';
import * as actions from './TasksDashboardActions';
import reducer from './TasksDashboardReducer';
import { TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS } from './TasksDashboardConstants';
import {
  selectTimePeriod,
  selectIsRunningSelected,
  selectIsPausedSelected,
  selectIsStoppedSelected,
  selectIsScheduledSelected,
  selectIsRunningLastSelected,
  selectIsRunningOverSelected,
  selectIsPausedLastSelected,
  selectIsPausedOverSelected,
  selectIsStoppedErrorSelected,
  selectIsStoppedWarningSelected,
  selectIsStoppedSuccessSelected,
  selectIsStoppedErrorLastSelected,
  selectIsStoppedWarningLastSelected,
  selectIsStoppedSuccessLastSelected,
} from './TasksDashboardSelectors';

const TIME_PERIOD = TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS.H12;

const mapStateToProps = state => ({
  timePeriod: selectTimePeriod(state),
  running: {
    selected: selectIsRunningSelected(state),
    lastSelected: selectIsRunningLastSelected(state, TIME_PERIOD),
    overSelected: selectIsRunningOverSelected(state, TIME_PERIOD),
  },
  paused: {
    selected: selectIsPausedSelected(state),
    lastSelected: selectIsPausedLastSelected(state, TIME_PERIOD),
    overSelected: selectIsPausedOverSelected(state, TIME_PERIOD),
  },
  stopped: {
    selected: selectIsStoppedSelected(state),
    errorSelected: selectIsStoppedErrorSelected(state, TIME_PERIOD),
    warningSelected: selectIsStoppedWarningSelected(state, TIME_PERIOD),
    successSelected: selectIsStoppedSuccessSelected(state, TIME_PERIOD),
    errorLastSelected: selectIsStoppedErrorLastSelected(state, TIME_PERIOD),
    warningLastSelected: selectIsStoppedWarningLastSelected(state, TIME_PERIOD),
    successLastSelected: selectIsStoppedSuccessLastSelected(state, TIME_PERIOD),
  },
  scheduled: {
    selected: selectIsScheduledSelected(state),
  },
});

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export const reducers = { tasksDashboard: reducer };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TasksDashboard);
