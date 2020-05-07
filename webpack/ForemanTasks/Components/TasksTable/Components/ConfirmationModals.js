import React from 'react';
import PropTypes from 'prop-types';
import {
  CONFIRM_MODAL,
  CANCEL_MODAL,
  RESUME_MODAL,
  CANCEL_SELECTED_MODAL,
  RESUME_SELECTED_MODAL,
} from '../TasksTableConstants';
import { ConfirmModal } from './ConfirmModal';

const modalProps = type => {
  if ([CANCEL_MODAL, CANCEL_SELECTED_MODAL].includes(type)) {
    return { actionText: 'cancel', actionState: 'stopped' };
  } else if ([RESUME_MODAL, RESUME_SELECTED_MODAL].includes(type))
    return { actionText: 'resume', actionState: 'running' };
  return { actionText: '', actionState: '' };
};

export const ConfirmationModals = ({
  setModalClosed,
  tasksActions,
  selectedRowsLen,
  modalID,
}) => (
  <React.Fragment>
    <ConfirmModal
      {...modalProps(modalID)}
      closeModal={setModalClosed}
      action={tasksActions[modalID]}
      selectedRowsLen={
        [CANCEL_MODAL, RESUME_MODAL].includes(modalID) ? 1 : selectedRowsLen
      }
      id={CONFIRM_MODAL}
    />
  </React.Fragment>
);

ConfirmationModals.propTypes = {
  setModalClosed: PropTypes.func.isRequired,
  modalID: PropTypes.string.isRequired,
  selectedRowsLen: PropTypes.number.isRequired,
  tasksActions: PropTypes.shape({
    cancelTask: PropTypes.func,
    resumeTask: PropTypes.func,
    cancelSelectedTasks: PropTypes.func,
    resumeSelectedTasks: PropTypes.func,
  }).isRequired,
};

export default ConfirmationModals;
