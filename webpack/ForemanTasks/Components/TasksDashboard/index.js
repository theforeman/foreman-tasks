import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TasksDashboard from './TasksDashboard';
import * as actions from './TasksDashboardActions';
import reducer from './TasksDashboardReducer';
import {
  selectTime,
  selectQuery,
  selectTasksSummary,
} from './TasksDashboardSelectors';

const mapStateToProps = state => ({
  time: selectTime(state),
  query: selectQuery(state),
  tasksSummary: selectTasksSummary(state),
});

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export const reducers = { tasksDashboard: reducer };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TasksDashboard);
