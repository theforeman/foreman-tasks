import { Modal, Button } from 'patternfly-react';
import PropTypes from 'prop-types';
import React from 'react';
import { translate as __ } from 'foremanReact/common/I18n';

export class ClickConfirmation extends React.Component {
  state = { disableConfirm: true };
  render() {
    const { disableConfirm } = this.state;
    const {
      title,
      body,
      confirmationMessage,
      confirmAction,
      path,
      confirmType,
      closeModal,
      showModal,
    } = this.props;
    const icon = confirmType === 'warning' ? confirmType : 'exclamation';
    return (
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
            <span className={`glyphicon glyphicon-${icon}-sign`} />
            {` ${title}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {body}
          <div>
            <input
              onChange={e => {
                this.setState({
                  disableConfirm: !e.target.checked,
                });
              }}
              type="checkbox"
            />
            {` ${confirmationMessage}`}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeModal}>{__('Cancel')}</Button>
          <Button
            href={path}
            data-method="post"
            bsStyle={confirmType}
            disabled={disableConfirm}
          >
            {confirmAction}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

ClickConfirmation.propTypes = {
  showModal: PropTypes.bool,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  confirmationMessage: PropTypes.string.isRequired,
  confirmAction: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  confirmType: PropTypes.oneOf(['warning', 'danger']),
  closeModal: PropTypes.func.isRequired,
};

ClickConfirmation.defaultProps = {
  showModal: false,
  confirmType: 'warning',
};

export default ClickConfirmation;
