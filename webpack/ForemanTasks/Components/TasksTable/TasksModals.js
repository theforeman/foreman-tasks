import React from 'react';
import PropTypes from 'prop-types';
import {
  CANCEL_MODAL,
  RESUME_MODAL,
  FORCE_UNLOCK_MODAL,
  CANCEL_SELECTED_MODAL,
  RESUME_SELECTED_MODAL,
  FORCE_UNLOCK_SELECTED_MODAL,
} from './TasksTableConstants';
import {
  CancelModal,
  ResumeModal,
  ForceUnlockModal,
  CancelSelectedModal,
  ResumeSelectedModal,
  ForceUnlockSelectedModal,
} from './Components/ConfirmModal';

const TasksModals = ({
  taskId,
  taskName,
  modalStates,
  closeModal,
  parentTaskID,
  selectAllOptions,
  uriQuery,
  reloadPage,
}) => (
  <>
    <CancelModal
      reloadPage={reloadPage}
      isModalOpen={modalStates[CANCEL_MODAL]}
      setIsModalOpen={() => closeModal(CANCEL_MODAL)}
      taskId={taskId}
      taskName={taskName}
    />
    <ResumeModal
      reloadPage={reloadPage}
      isModalOpen={modalStates[RESUME_MODAL]}
      setIsModalOpen={() => closeModal(RESUME_MODAL)}
      taskId={taskId}
      taskName={taskName}
    />
    <ForceUnlockModal
      reloadPage={reloadPage}
      isModalOpen={modalStates[FORCE_UNLOCK_MODAL]}
      setIsModalOpen={() => closeModal(FORCE_UNLOCK_MODAL)}
      taskId={taskId}
      taskName={taskName}
    />
    <CancelSelectedModal
      reloadPage={reloadPage}
      isModalOpen={modalStates[CANCEL_SELECTED_MODAL]}
      setIsModalOpen={() => closeModal(CANCEL_SELECTED_MODAL)}
      uriQuery={uriQuery}
      selectAllOptions={selectAllOptions}
    />
    <ResumeSelectedModal
      reloadPage={reloadPage}
      isModalOpen={modalStates[RESUME_SELECTED_MODAL]}
      setIsModalOpen={() => closeModal(RESUME_SELECTED_MODAL)}
      uriQuery={uriQuery}
      parentTaskID={parentTaskID}
      selectAllOptions={selectAllOptions}
    />
    <ForceUnlockSelectedModal
      reloadPage={reloadPage}
      isModalOpen={modalStates[FORCE_UNLOCK_SELECTED_MODAL]}
      setIsModalOpen={() => closeModal(FORCE_UNLOCK_SELECTED_MODAL)}
      uriQuery={uriQuery}
      parentTaskID={parentTaskID}
      selectAllOptions={selectAllOptions}
    />
  </>
);

TasksModals.propTypes = {
  taskId: PropTypes.string,
  taskName: PropTypes.string,
  modalStates: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
  parentTaskID: PropTypes.string,
  selectAllOptions: PropTypes.object.isRequired,
  uriQuery: PropTypes.string,
  reloadPage: PropTypes.func.isRequired,
};

TasksModals.defaultProps = {
  taskId: null,
  taskName: null,
  parentTaskID: null,
  uriQuery: null,
};

export default TasksModals;
