import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ConfirmModal } from './ConfirmModal';
import reducer from './ConfirmModalReducer';
import tasksActions from './ConfirmModalActions';
import {
  selectActionText,
  selectActionState,
  selectActionType,
  selectClicked,
  selectSelectedRowsLen,
} from './ConfirmModalSelectors';
import { selectAllRowsSelected } from '../../TasksTableSelectors';

const mapStateToProps = state => ({
  actionText: selectActionText(state),
  actionType: selectActionType(state),
  actionState: selectActionState(state),
  allRowsSelected: selectAllRowsSelected(state),
  clicked: selectClicked(state),
  selectedRowsLen: selectSelectedRowsLen(state),
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(tasksActions, dispatch);

export const reducers = { confirmModal: reducer };

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmModal);
