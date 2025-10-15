import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { sprintf } from 'foremanReact/common/I18n';
import { selectClicked } from './ConfirmModalSelectors';
import { GenericConfirmModal } from './GenericConfirmModal';

export const createTaskModal = ({
  actionCreator,
  title,
  messageTemplate,
  confirmButtonVariant = 'primary',
  ouiaIdPrefix,
}) => {
  const TaskModal = ({ isModalOpen, setIsModalOpen, url, parentTaskID }) => {
    const { taskId, taskName } = useSelector(selectClicked);

    const handleConfirm = () =>
      actionCreator({
        taskId,
        taskName,
        url,
        parentTaskID,
      });

    return (
      <GenericConfirmModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        title={title}
        message={sprintf(messageTemplate, { taskName })}
        onConfirm={handleConfirm}
        confirmButtonVariant={confirmButtonVariant}
        ouiaIdPrefix={ouiaIdPrefix}
      />
    );
  };

  TaskModal.propTypes = {
    isModalOpen: PropTypes.bool.isRequired,
    setIsModalOpen: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    parentTaskID: PropTypes.string,
  };

  TaskModal.defaultProps = {
    parentTaskID: null,
  };

  return TaskModal;
};
