import React from 'react';
import PropTypes from 'prop-types';
import { sprintf, translate as __ } from 'foremanReact/common/I18n';
import { ActionConfirmation } from './ActionConfirmation';
import { CANCEL, RESUME, CLOSED } from '../TasksTableConstants';

export const CancelResumeConfirm = ({
  closeModal,
  modalStatus,
  action,
  selected,
  selectedRowsLen,
}) => (
  <ActionConfirmation
    showModal={modalStatus !== CLOSED}
    closeModal={closeModal}
    title={`${modalStatus === CANCEL ? __('Cancel') : __('Resume')} ${__(
      'Selected Tasks'
    )}`}
    message={sprintf(
      __(
        `This will ${
          modalStatus === CANCEL ? 'stop' : 'resume'
        } %s tasks, putting them in the ${
          modalStatus === CANCEL ? 'canceled' : 'running'
        } state.  Are you sure?`
      ),
      selectedRowsLen
    )}
    onClick={() => {
      if (modalStatus === CANCEL) {
        action(CANCEL, selected);
      } else if (modalStatus === RESUME) {
        action(RESUME, selected);
      }
      closeModal();
    }}
    confirmAction={__('Yes')}
    abortAction={__('No')}
  />
);

CancelResumeConfirm.propTypes = {
  closeModal: PropTypes.func.isRequired,
  modalStatus: PropTypes.oneOf([CANCEL, RESUME, CLOSED]).isRequired,
  selectedRowsLen: PropTypes.number.isRequired,
  action: PropTypes.func.isRequired,
  selected: PropTypes.array.isRequired,
};

export default CancelResumeConfirm;
