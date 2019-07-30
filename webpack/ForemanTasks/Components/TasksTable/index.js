import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import TasksTablePage from './TasksTablePage';
import reducer from './TasksTableReducer';
import * as actions from './TasksTableActions';
import { selectQuery } from '../TasksDashboard/TasksDashboardSelectors';
import {
  selectStatus,
  selectError,
  selectResults,
  selectPagitation,
  selectItemCount,
  selectSort,
  selectActionName,
} from './TasksTableSelectors';

const mapStateToProps = state => ({
  status: selectStatus(state),
  error: selectError(state),
  sort: selectSort(state),
  results: selectResults(state),
  query: selectQuery(state),
  pagination: selectPagitation(state),
  itemCount: selectItemCount(state),
  actionName: selectActionName(state),
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export const reducers = { tasksTable: reducer };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TasksTablePage);
