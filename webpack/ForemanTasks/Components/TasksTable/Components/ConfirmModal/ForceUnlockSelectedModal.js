import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { sprintf, translate as __ } from 'foremanReact/common/I18n';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import {
  bulkForceCancelBySearch,
  bulkForceCancelById,
} from '../../TasksBulkActions';
import {
  selectSelectedTasks,
  selectSelectedRowsLen,
} from './ConfirmModalSelectors';
import { selectAllRowsSelected } from '../../TasksTableSelectors';

const ForceUnlockSelectedModal = ({
  isModalOpen,
  setIsModalOpen,
  url,
  uriQuery,
  parentTaskID,
}) => {
  const dispatch = useDispatch();
  const allRowsSelected = useSelector(selectAllRowsSelected);
  const selectedTasks = useSelector(selectSelectedTasks);
  const selectedRowsLen = useSelector(selectSelectedRowsLen);

  const handleConfirm = () => {
    if (allRowsSelected) {
      dispatch(bulkForceCancelBySearch({ query: uriQuery, parentTaskID }));
    } else {
      dispatch(
        bulkForceCancelById({
          selected: selectedTasks,
          url,
          parentTaskID,
        })
      );
    }
    setIsModalOpen(false);
  };

  return (
    <Modal
      title={__('Force Unlock Selected Tasks')}
      variant={ModalVariant.small}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      ouiaId="force-unlock-selected-modal"
      actions={[
        <Button
          ouiaId="force-unlock-selected-modal-confirm-button"
          key="confirm"
          className="confirm-button"
          variant="danger"
          onClick={handleConfirm}
        >
          {__('Yes')}
        </Button>,
        <Button
          ouiaId="force-unlock-selected-modal-cancel-button"
          key="cancel"
          variant="secondary"
          onClick={() => setIsModalOpen(false)}
        >
          {__('No')}
        </Button>,
      ]}
    >
      {sprintf(
        __(
          'This will force unlock %(number)s task(s). This may cause harm and should be used with caution. Are you sure?'
        ),
        { number: selectedRowsLen }
      )}
    </Modal>
  );
};

ForceUnlockSelectedModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
  uriQuery: PropTypes.object,
  parentTaskID: PropTypes.string,
};

ForceUnlockSelectedModal.defaultProps = {
  uriQuery: {},
  parentTaskID: null,
};

export default ForceUnlockSelectedModal;
