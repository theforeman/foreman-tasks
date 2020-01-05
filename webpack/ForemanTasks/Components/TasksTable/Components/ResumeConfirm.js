import React from 'react';
import PropTypes from 'prop-types';
import { sprintf, translate as __ } from 'foremanReact/common/I18n';
import { Button } from 'patternfly-react';
import ForemanModal from 'foremanReact/components/ForemanModal';
import {
  CANCEL_CONFIRM_MODAL_ID,
  RESUME_CONFIRM_MODAL_ID,
  CANCEL_SELECTED_CONFIRM_MODAL_ID,
  RESUME_SELECTED_CONFIRM_MODAL_ID,
} from '../TasksTableConstants';

export const ResumeConfirm = ({ closeModal, action, selectedRowsLen, id }) => (
  <ForemanModal title={__('Resume Selected Tasks')} id={id}>
    {sprintf(
      __(
        `This will resume %s task(s), putting them in the running state. Are you sure?`
      ),
      selectedRowsLen
    )}
    <ForemanModal.Footer>
      <Button onClick={closeModal}>{__('No')}</Button>
      <Button
        bsStyle="primary"
        onClick={() => {
          action();
          closeModal();
        }}
      >
        {__('Yes')}
      </Button>
    </ForemanModal.Footer>
  </ForemanModal>
);

ResumeConfirm.propTypes = {
  closeModal: PropTypes.func.isRequired,
  selectedRowsLen: PropTypes.number.isRequired,
  action: PropTypes.func,
  id: PropTypes.oneOf([
    CANCEL_CONFIRM_MODAL_ID,
    RESUME_CONFIRM_MODAL_ID,
    CANCEL_SELECTED_CONFIRM_MODAL_ID,
    RESUME_SELECTED_CONFIRM_MODAL_ID,
  ]).isRequired,
};

ResumeConfirm.defaultProps = {
  action: () => null,
};

export default ResumeConfirm;
