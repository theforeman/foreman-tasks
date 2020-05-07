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
  selectPagitation,
  selectItemCount,
  selectSort,
  selectActionName,
  selectSelectedRows,
  selectClicked,
  selectAllRowsSelected,
  selectShowSelectAll,
  selectModalID,
} from './TasksTableSelectors';

const mapStateToProps = state => ({
  status: selectStatus(state),
  error: selectError(state),
  sort: selectSort(state),
  results: selectResults(state),
  pagination: selectPagitation(state),
  itemCount: selectItemCount(state),
  actionName: selectActionName(state),
  selectedRows: selectSelectedRows(state),
  clicked: selectClicked(state),
  allRowsSelected: selectAllRowsSelected(state),
  showSelectAll: selectShowSelectAll(state),
  modalID: selectModalID(state),
});

const mapDispatchToProps = dispatch =>
  bindActionCreators({ ...tableActions, ...bulkActions }, dispatch);

export const reducers = { tasksTable: reducer };

export default connect(mapStateToProps, mapDispatchToProps)(TasksTablePage);
