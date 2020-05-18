import React from 'react';
import PropTypes from 'prop-types';
import { startCase } from 'lodash';
import { sprintf, translate as __ } from 'foremanReact/common/I18n';
import { Button } from 'patternfly-react';
import ForemanModal from 'foremanReact/components/ForemanModal';
import { useForemanModal } from 'foremanReact/components/ForemanModal/ForemanModalHooks';
import { CANCEL_MODAL, RESUME_MODAL } from '../../TasksTableConstants';

export const ConfirmModal = ({
  actionText,
  actionState,
  tasksActions,
  actionType,
  selectedRowsLen,
  id,
}) => {
  const { setModalClosed } = useForemanModal({
    id,
  });
  if ([CANCEL_MODAL, RESUME_MODAL].includes(actionType)) {
    selectedRowsLen = 1;
  }
  return (
    <ForemanModal
      title={sprintf(__('%s Selected Tasks'), startCase(actionText))}
      id={id}
    >
      {sprintf(
        __(
          `This will %(action)s %(number)s task(s), putting them in the %(state)s state. Are you sure?`
        ),
        { action: actionText, number: selectedRowsLen, state: actionState }
      )}
      <ForemanModal.Footer>
        <Button onClick={setModalClosed}>{__('No')}</Button>
        <Button
          bsStyle="primary"
          onClick={() => {
            tasksActions[actionType]();
            setModalClosed();
          }}
        >
          {__('Yes')}
        </Button>
      </ForemanModal.Footer>
    </ForemanModal>
  );
};

ConfirmModal.propTypes = {
  actionText: PropTypes.string,
  actionState: PropTypes.string,
  selectedRowsLen: PropTypes.number.isRequired,
  tasksActions: PropTypes.shape({
    CANCEL_SELECTED_MODAL: PropTypes.func,
    RESUME_SELECTED_MODAL: PropTypes.func,
    RESUME_MODAL: PropTypes.func,
    CANCEL_MODAL: PropTypes.func,
  }).isRequired,
  actionType: PropTypes.string,
  id: PropTypes.string.isRequired,
};

ConfirmModal.defaultProps = {
  actionType: '',
  actionText: '',
  actionState: '',
};

export default ConfirmModal;
