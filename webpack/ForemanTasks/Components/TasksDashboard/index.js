import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TasksDashboard from './TasksDashboard';
import * as actions from './TasksDashboardActions';
import reducer from './TasksDashboardReducer';
import {
  selectTimePeriod,
  selectTasksSummary,
} from './TasksDashboardSelectors';
import './TasksDashboard.scss';

const mapStateToProps = state => ({
  timePeriod: selectTimePeriod(state),
  tasksSummary: selectTasksSummary(state),
});

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export const reducers = { tasksDashboard: reducer };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TasksDashboard);
