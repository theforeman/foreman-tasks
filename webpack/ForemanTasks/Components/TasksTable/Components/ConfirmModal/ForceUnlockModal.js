import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { sprintf, translate as __ } from 'foremanReact/common/I18n';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { forceCancelTask } from '../../TasksTableActions';
import { selectClicked } from './ConfirmModalSelectors';

const ForceUnlockModal = ({
  isModalOpen,
  setIsModalOpen,
  url,
  parentTaskID,
}) => {
  const dispatch = useDispatch();
  const { taskId, taskName } = useSelector(selectClicked);

  const handleConfirm = () => {
    dispatch(
      forceCancelTask({
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
      title={__('Force Unlock Task')}
      variant={ModalVariant.small}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      ouiaId="force-unlock-modal"
      actions={[
        <Button
          ouiaId="force-unlock-modal-confirm-button"
          key="confirm"
          className="confirm-button"
          variant="danger"
          onClick={handleConfirm}
        >
          {__('Yes')}
        </Button>,
        <Button
          ouiaId="force-unlock-modal-cancel-button"
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
          'This will force unlock task "%(taskName)s". This may cause harm and should be used with caution. Are you sure?'
        ),
        { taskName }
      )}
    </Modal>
  );
};

ForceUnlockModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
  parentTaskID: PropTypes.string,
};

ForceUnlockModal.defaultProps = {
  parentTaskID: null,
};

export default ForceUnlockModal;
