import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { sprintf, translate as __ } from 'foremanReact/common/I18n';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { bulkCancelBySearch, bulkCancelById } from '../../TasksBulkActions';
import {
  selectSelectedTasks,
  selectSelectedRowsLen,
} from './ConfirmModalSelectors';
import { selectAllRowsSelected } from '../../TasksTableSelectors';

const CancelSelectedModal = ({
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
      dispatch(bulkCancelBySearch({ query: uriQuery, parentTaskID }));
    } else {
      dispatch(
        bulkCancelById({
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
      title={__('Cancel Selected Tasks')}
      variant={ModalVariant.small}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      ouiaId="cancel-selected-modal"
      actions={[
        <Button
          ouiaId="cancel-selected-modal-confirm-button"
          key="confirm"
          className="confirm-button"
          variant="primary"
          onClick={handleConfirm}
        >
          {__('Yes')}
        </Button>,

        <Button
          ouiaId="cancel-selected-modal-cancel-button"
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
          'This will cancel %(number)s task(s), putting them in the stopped state. Are you sure?'
        ),
        { number: selectedRowsLen }
      )}
    </Modal>
  );
};

CancelSelectedModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
  uriQuery: PropTypes.object,
  parentTaskID: PropTypes.string,
};

CancelSelectedModal.defaultProps = {
  uriQuery: {},
  parentTaskID: null,
};

export default CancelSelectedModal;
