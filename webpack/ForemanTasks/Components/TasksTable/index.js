import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import TasksTablePage from './TasksTablePage';
import reducer from './TasksTableReducer';
import * as tableActions from './TasksTableActions';
import * as bulkActions from './TasksBulkActions';
import {
  selectStatus,
  selectError,
  selectResults,
  selectPerPage,
  selectItemCount,
  selectSort,
  selectActionName,
  selectSelectedRows,
  selectAllRowsSelected,
  selectShowSelectAll,
  selectModalID,
  selectPermissions,
} from './TasksTableSelectors';

const mapStateToProps = state => ({
  status: selectStatus(state),
  error: selectError(state),
  sort: selectSort(state),
  results: selectResults(state),
  perPage: selectPerPage(state),
  itemCount: selectItemCount(state),
  actionName: selectActionName(state),
  selectedRows: selectSelectedRows(state),
  allRowsSelected: selectAllRowsSelected(state),
  showSelectAll: selectShowSelectAll(state),
  modalID: selectModalID(state),
  permissions: selectPermissions(state),
});

const mapDispatchToProps = dispatch =>
  bindActionCreators({ ...tableActions, ...bulkActions }, dispatch);

export const reducers = { tasksTable: reducer };

export default connect(mapStateToProps, mapDispatchToProps)(TasksTablePage);
