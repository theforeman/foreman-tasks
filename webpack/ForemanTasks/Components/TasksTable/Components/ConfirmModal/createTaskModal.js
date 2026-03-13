import React from 'react';
import PropTypes from 'prop-types';
import { sprintf } from 'foremanReact/common/I18n';
import { GenericConfirmModal } from './GenericConfirmModal';

export const createTaskModal = ({
  actionCreator,
  title,
  messageTemplate,
  confirmButtonVariant = 'primary',
  ouiaIdPrefix,
}) => {
  const TaskModal = ({
    isModalOpen,
    setIsModalOpen,
    reloadPage,
    taskId,
    taskName,
  }) => {
    const handleConfirm = () => actionCreator(taskId, taskName);

    return (
      <GenericConfirmModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        title={title}
        message={sprintf(messageTemplate, { taskName })}
        onConfirm={handleConfirm}
        confirmButtonVariant={confirmButtonVariant}
        ouiaIdPrefix={ouiaIdPrefix}
        reloadPage={reloadPage}
      />
    );
  };

  TaskModal.propTypes = {
    isModalOpen: PropTypes.bool.isRequired,
    setIsModalOpen: PropTypes.func.isRequired,
    reloadPage: PropTypes.func.isRequired,
    taskId: PropTypes.string,
    taskName: PropTypes.string,
  };

  TaskModal.defaultProps = {
    taskId: null,
    taskName: null,
  };

  return TaskModal;
};
