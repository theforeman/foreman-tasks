import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'patternfly-react';
import ForemanModal from 'foremanReact/components/ForemanModal';
import { translate as __ } from 'foremanReact/common/I18n';
import { useForemanModal } from 'foremanReact/components/ForemanModal/ForemanModalHooks';
import './ClickConfirmation.scss';

export const ClickConfirmation = ({
  title,
  confirmType,
  body,
  confirmationMessage,
  id,
  confirmAction,
  onClick,
}) => {
  const [isConfirmed, setConfirm] = useState(false);
  const { setModalClosed, modalOpen } = useForemanModal({
    id,
  });
  useEffect(() => {
    setConfirm(false);
  }, [modalOpen]);
  const icon = confirmType === 'warning' ? confirmType : 'exclamation';

  return (
    <ForemanModal id={id}>
      <ForemanModal.Header>
        <span className={`glyphicon glyphicon-${icon}-sign`} />
        {` ${title}`}
      </ForemanModal.Header>
      <span>{body}</span>
      <div className="confirmation-check">
        <input
          onChange={e => {
            setConfirm(e.target.checked);
          }}
          checked={isConfirmed}
          type="checkbox"
        />
        <span>{` ${confirmationMessage}`}</span>
      </div>
      <ForemanModal.Footer>
        <Button
          className="confirm-button"
          onClick={() => {
            onClick();
            setModalClosed();
          }}
          bsStyle={confirmType}
          disabled={!isConfirmed}
        >
          {confirmAction}
        </Button>
        <Button onClick={setModalClosed}>{__('Cancel')}</Button>
      </ForemanModal.Footer>
    </ForemanModal>
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
};

ClickConfirmation.defaultProps = {
  confirmType: 'warning',
};

export default ClickConfirmation;
