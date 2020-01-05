import React from 'react';
import PropTypes from 'prop-types';
import {
  CANCEL_CONFIRM_MODAL_ID,
  RESUME_CONFIRM_MODAL_ID,
  CANCEL_SELECTED_CONFIRM_MODAL_ID,
  RESUME_SELECTED_CONFIRM_MODAL_ID,
} from '../TasksTableConstants';
import { CancelConfirm } from './CancelConfirm';
import { ResumeConfirm } from './ResumeConfirm';

export const ConfirmationModals = ({
  modalProps,
  tasksActions,
  selectedRowsLen,
}) => (
  <React.Fragment>
    <CancelConfirm
      closeModal={modalProps.cancelModal.setModalClosed}
      action={tasksActions.cancelTask}
      selectedRowsLen={1}
      id={CANCEL_CONFIRM_MODAL_ID}
    />
    <ResumeConfirm
      closeModal={modalProps.resumeModal.setModalClosed}
      action={tasksActions.resumeTask}
      selectedRowsLen={1}
      id={RESUME_CONFIRM_MODAL_ID}
    />
    <CancelConfirm
      closeModal={modalProps.cancelSelectedModal.setModalClosed}
      action={tasksActions.cancelSelectedTasks}
      selectedRowsLen={selectedRowsLen}
      id={CANCEL_SELECTED_CONFIRM_MODAL_ID}
    />
    <ResumeConfirm
      closeModal={modalProps.resumeSelectedModal.setModalClosed}
      action={tasksActions.resumeSelectedTasks}
      selectedRowsLen={selectedRowsLen}
      id={RESUME_SELECTED_CONFIRM_MODAL_ID}
    />
  </React.Fragment>
);

ConfirmationModals.propTypes = {
  modalProps: PropTypes.object.isRequired,
  selectedRowsLen: PropTypes.number.isRequired,
  tasksActions: PropTypes.shape({
    cancelTask: PropTypes.func,
    resumeTask: PropTypes.func,
    cancelSelectedTasks: PropTypes.func,
    resumeSelectedTasks: PropTypes.func,
  }).isRequired,
};

export default ConfirmationModals;
