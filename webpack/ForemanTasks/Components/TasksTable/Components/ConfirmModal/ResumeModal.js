import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { sprintf, translate as __ } from 'foremanReact/common/I18n';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { resumeTask } from '../../TasksTableActions';
import { selectClicked } from './ConfirmModalSelectors';

const ResumeModal = ({ isModalOpen, setIsModalOpen, url, parentTaskID }) => {
  const dispatch = useDispatch();
  const { taskId, taskName } = useSelector(selectClicked);

  const handleConfirm = () => {
    dispatch(
      resumeTask({
        taskId,
        taskName,
        url,
        parentTaskID,
      })
    );
    setIsModalOpen(false);
  };

  return (
    <Modal
      title={__('Resume Task')}
      variant={ModalVariant.small}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      ouiaId="resume-modal"
      actions={[
        <Button
          ouiaId="resume-modal-confirm-button"
          key="confirm"
          className="confirm-button"
          variant="primary"
          onClick={handleConfirm}
        >
          {__('Yes')}
        </Button>,

        <Button
          ouiaId="resume-modal-cancel-button"
          key="cancel"
          variant="secondary"
          onClick={() => setIsModalOpen(false)}
        >
          {__('No')}
        </Button>,
      ]}
    >
      {sprintf(
        __(
          'This will resume task "%(taskName)s", putting it in the running state. Are you sure?'
        ),
        { taskName }
      )}
    </Modal>
  );
};

ResumeModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
  parentTaskID: PropTypes.string,
};

ResumeModal.defaultProps = {
  parentTaskID: null,
};

export default ResumeModal;
