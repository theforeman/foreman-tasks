import { connect } from 'react-redux';
import { ConfirmModal } from './ConfirmModal';
import reducer from './ConfirmModalReducer';
import {
  selectActionText,
  selectActionState,
  selectActionType,
} from './ConfirmModalSelectors';

const mapStateToProps = state => ({
  actionText: selectActionText(state),
  actionType: selectActionType(state),
  actionState: selectActionState(state),
});

export const reducers = { confirmModal: reducer };

export default connect(mapStateToProps)(ConfirmModal);
