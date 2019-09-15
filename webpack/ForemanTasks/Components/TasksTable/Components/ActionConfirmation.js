import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'patternfly-react';

export const ActionConfirmation = ({
  showModal,
  closeModal,
  title,
  message,
  onClick,
  confirmAction,
  abortAction,
}) => (
  <Modal show={showModal} onHide={closeModal}>
    <Modal.Header>
      <Button
        className="close"
        onClick={closeModal}
        aria-hidden="true"
        aria-label="Close"
      >
        &times;
      </Button>
      <Modal.Title>
        <span className="glyphicon glyphicon-warning-sign" />
        {` ${title}`}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>{message}</Modal.Body>
    <Modal.Footer>
      <Button onClick={closeModal}>{abortAction}</Button>
      <Button bsStyle="primary" onClick={onClick}>
        {confirmAction}
      </Button>
    </Modal.Footer>
  </Modal>
);

ActionConfirmation.propTypes = {
  showModal: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmAction: PropTypes.string.isRequired,
  abortAction: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ActionConfirmation;
