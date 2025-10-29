import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { sprintf, translate as __ } from 'foremanReact/common/I18n';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { cancelTask } from '../../TasksTableActions';
import { selectClicked } from './ConfirmModalSelectors';

const CancelModal = ({ isModalOpen, setIsModalOpen, url, parentTaskID }) => {
  const dispatch = useDispatch();
  const { taskId, taskName } = useSelector(selectClicked);

  const handleConfirm = () => {
    dispatch(
      cancelTask({
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
      title={__('Cancel Task')}
      variant={ModalVariant.small}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      ouiaId="cancel-modal"
      actions={[
        <Button
          ouiaId="cancel-modal-confirm-button"
          key="confirm"
          className="confirm-button"
          variant="primary"
          onClick={handleConfirm}
        >
          {__('Yes')}
        </Button>,

        <Button
          ouiaId="cancel-modal-cancel-button"
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
          'This will cancel task "%(taskName)s", putting it in the stopped state. Are you sure?'
        ),
        { taskName }
      )}
    </Modal>
  );
};

CancelModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
  parentTaskID: PropTypes.string,
};

CancelModal.defaultProps = {
  parentTaskID: null,
};

export default CancelModal;
