import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { translate as __ } from 'foremanReact/common/I18n';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';

export const GenericConfirmModal = ({
  isModalOpen,
  setIsModalOpen,
  title,
  message,
  onConfirm,
  confirmButtonVariant,
  ouiaIdPrefix,
}) => {
  const dispatch = useDispatch();

  const handleConfirm = () => {
    const action = onConfirm();
    if (action) {
      dispatch(action);
    }
    setIsModalOpen(false);
  };

  return (
    <Modal
      title={title}
      variant={ModalVariant.small}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      ouiaId={`${ouiaIdPrefix}-modal`}
      actions={[
        <Button
          ouiaId={`${ouiaIdPrefix}-modal-confirm-button`}
          key="confirm"
          className="confirm-button"
          variant={confirmButtonVariant}
          onClick={handleConfirm}
        >
          {__('Yes')}
        </Button>,
        <Button
          ouiaId={`${ouiaIdPrefix}-modal-cancel-button`}
          key="cancel"
          variant="secondary"
          onClick={() => setIsModalOpen(false)}
        >
          {__('No')}
        </Button>,
      ]}
    >
      {message}
    </Modal>
  );
};

GenericConfirmModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  confirmButtonVariant: PropTypes.string,
  ouiaIdPrefix: PropTypes.string.isRequired,
};

GenericConfirmModal.defaultProps = {
  confirmButtonVariant: 'primary',
};
