import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalVariant,
  Checkbox,
  TextContent,
} from '@patternfly/react-core';
import { translate as __, sprintf } from 'foremanReact/common/I18n';
import {
  UNLOCK_MODAL,
  FORCE_UNLOCK_MODAL,
} from '../../TaskActions/TaskActionsConstants';

export const ClickConfirmation = ({
  title,
  confirmType,
  body,
  confirmationMessage,
  id,
  confirmAction,
  onClick,
  isOpen,
  setModalClosed,
}) => {
  const [isConfirmed, setConfirm] = useState(false);
  const onClose = () => {
    setConfirm(false);
    setModalClosed();
  };
  return (
    <Modal
      title={title}
      titleIconVariant={confirmType}
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={onClose}
      ouiaId={`${id}-modal`}
      actions={[
        <Button
          ouiaId={`${id}-cancel-button`}
          key="cancel"
          variant="secondary"
          onClick={onClose}
        >
          {__('Cancel')}
        </Button>,
        <Button
          ouiaId={`${id}-confirm-button`}
          key="confirm"
          className="confirm-button"
          variant={confirmType === 'danger' ? 'danger' : 'primary'}
          onClick={() => {
            onClick();
            onClose();
          }}
          isDisabled={!isConfirmed}
        >
          {confirmAction}
        </Button>,
      ]}
    >
      <TextContent>
        {body}
        <Checkbox
          ouiaId={`${id}-confirmation-checkbox`}
          id={`confirmation-checkbox-${id}`}
          label={confirmationMessage}
          isChecked={isConfirmed}
          onChange={(_e, checked) => setConfirm(checked)}
        />
      </TextContent>
    </Modal>
  );
};

ClickConfirmation.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  confirmationMessage: PropTypes.string.isRequired,
  confirmAction: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  confirmType: PropTypes.oneOf(['warning', 'danger']),
  id: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  setModalClosed: PropTypes.func,
};

ClickConfirmation.defaultProps = {
  confirmType: 'warning',
  isOpen: false,
  setModalClosed: () => {},
};

// Unlock Modal Components
const confirmationMessage = __(
  'I understand that this may cause harm and have working database backups of all backend services.'
);

export const UnlockConfirmationModal = ({
  onClick,
  id,
  isOpen,
  setModalClosed,
}) => (
  <ClickConfirmation
    id={id}
    title={__('Unlock')}
    body={__(
      "This will unlock the resources that the task is running against. Please note that this might lead to inconsistent state and should be used with caution, after making sure that the task can't be resumed."
    )}
    confirmationMessage={confirmationMessage}
    confirmAction={__('Unlock')}
    onClick={onClick}
    confirmType="warning"
    isOpen={isOpen}
    setModalClosed={setModalClosed}
  />
);

export const ForceUnlockConfirmationModal = ({
  onClick,
  id,
  selectedRowsLen,
  isOpen,
  setModalClosed,
}) => (
  <ClickConfirmation
    id={id}
    title={__('Force Unlock')}
    body={sprintf(
      __(
        `Resources for %s task(s) will be unlocked and will not prevent other tasks from being run. As the task(s) might be still running, it should be avoided to use this unless you are really sure the task(s) got stuck.`
      ),
      selectedRowsLen
    )}
    confirmationMessage={confirmationMessage}
    confirmAction={__('Force Unlock')}
    onClick={onClick}
    confirmType="danger"
    isOpen={isOpen}
    setModalClosed={setModalClosed}
  />
);

UnlockConfirmationModal.propTypes = {
  onClick: PropTypes.func.isRequired,
  id: PropTypes.string,
  isOpen: PropTypes.bool,
  setModalClosed: PropTypes.func,
};

ForceUnlockConfirmationModal.propTypes = {
  onClick: PropTypes.func.isRequired,
  id: PropTypes.string,
  selectedRowsLen: PropTypes.number,
  isOpen: PropTypes.bool,
  setModalClosed: PropTypes.func,
};

UnlockConfirmationModal.defaultProps = {
  id: UNLOCK_MODAL,
  isOpen: false,
  setModalClosed: () => {},
};

ForceUnlockConfirmationModal.defaultProps = {
  id: FORCE_UNLOCK_MODAL,
  selectedRowsLen: 1,
  isOpen: false,
  setModalClosed: () => {},
};

export default ClickConfirmation;
