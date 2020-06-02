import React from 'react';
import PropTypes from 'prop-types';
import { startCase } from 'lodash';
import { sprintf, translate as __ } from 'foremanReact/common/I18n';
import { Button } from 'patternfly-react';
import ForemanModal from 'foremanReact/components/ForemanModal';
import { FORCE_UNLOCK_MODAL } from '../../../TaskActions/TaskActionsConstants';
import { FORCE_UNLOCK_SELECTED_MODAL } from '../../TasksTableConstants';
import { ForceUnlockModal } from '../../../TaskActions/UnlockModals';

export const ConfirmModal = ({
  actionText,
  actionState,
  actionType,
  selectedRowsLen,
  id,
  parentTaskID,
  url,
  uriQuery: query,
  setModalClosed,
  ...props
}) => {
  if ([FORCE_UNLOCK_MODAL, FORCE_UNLOCK_SELECTED_MODAL].includes(actionType)) {
    return (
      <ForceUnlockModal
        onClick={() => {
          props[actionType]({ url, query, parentTaskID });
          setModalClosed();
        }}
        id={id}
        selectedRowsLen={selectedRowsLen}
      />
    );
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
          className="confirm-button"
          bsStyle="primary"
          onClick={() => {
            props[actionType]({ url, query, parentTaskID });
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
  actionType: PropTypes.string,
  id: PropTypes.string.isRequired,
  parentTaskID: PropTypes.string,
  url: PropTypes.string.isRequired,
  uriQuery: PropTypes.object,
  setModalClosed: PropTypes.func.isRequired,
};

ConfirmModal.defaultProps = {
  actionType: '',
  actionText: '',
  actionState: '',
  parentTaskID: '',
  uriQuery: {},
};

export default ConfirmModal;
