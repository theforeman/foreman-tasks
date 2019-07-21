import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import TasksTablePage from './TasksTablePage';
import reducer from './TasksTableReducer';
import * as actions from './TasksTableActions';
import {
  selectResults,
  selectTasksTable,
  selectTasksTablePagitanion,
  tasksPageSearchString,
  tasksPageSearchLabels,
} from './TasksTableSelectors';

const mapStateToProps = state => ({
  ...selectTasksTablePagitanion(state),
  ...selectTasksTable(state),
  search: tasksPageSearchString(state),
  results: selectResults(state),
  searchLabels: tasksPageSearchLabels(state),
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export const reducers = { tasksTable: reducer };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TasksTablePage);
