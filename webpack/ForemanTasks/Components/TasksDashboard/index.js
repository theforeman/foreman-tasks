import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TasksDashboard from './TasksDashboard';
import * as actions from './TasksDashboardActions';
import reducer from './TasksDashboardReducer';
import { selectTime, selectQuery } from './TasksDashboardSelectors';
import { MOCKED_DATA } from './TasksDashboardConstants';

const mapStateToProps = state => ({
  time: selectTime(state),
  query: selectQuery(state),
  data: MOCKED_DATA,
});

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export const reducers = { tasksDashboard: reducer };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TasksDashboard);
