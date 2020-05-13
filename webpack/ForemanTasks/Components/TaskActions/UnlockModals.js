import React from 'react';
import PropTypes from 'prop-types';
import { translate as __, sprintf } from 'foremanReact/common/I18n';
import { ClickConfirmation } from '../common/ClickConfirmation';
import { UNLOCK_MODAL, FORCE_UNLOCK_MODAL } from './TaskActionsConstants';

const confirmationMessage = __(
  'I understand that this may cause harm and have working database backups of all backend services.'
);

export const UnlockModal = ({ onClick, id }) => (
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
  />
);

export const ForceUnlockModal = ({ onClick, id, selectedRowsLen }) => (
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
  />
);

UnlockModal.propTypes = {
  onClick: PropTypes.func.isRequired,
  id: PropTypes.string,
};

ForceUnlockModal.propTypes = {
  onClick: PropTypes.func.isRequired,
  id: PropTypes.string,
  selectedRowsLen: PropTypes.number,
};

UnlockModal.defaultProps = {
  id: UNLOCK_MODAL,
};

ForceUnlockModal.defaultProps = {
  id: FORCE_UNLOCK_MODAL,
  selectedRowsLen: 1,
};
