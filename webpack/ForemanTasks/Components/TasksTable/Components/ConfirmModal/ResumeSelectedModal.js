import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { sprintf, translate as __ } from 'foremanReact/common/I18n';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { bulkResumeBySearch, bulkResumeById } from '../../TasksBulkActions';
import {
  selectSelectedTasks,
  selectSelectedRowsLen,
} from './ConfirmModalSelectors';
import { selectAllRowsSelected } from '../../TasksTableSelectors';

const ResumeSelectedModal = ({
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
      dispatch(bulkResumeBySearch({ query: uriQuery, parentTaskID }));
    } else {
      dispatch(
        bulkResumeById({
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
      title={__('Resume Selected Tasks')}
      variant={ModalVariant.small}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      ouiaId="resume-selected-modal"
      actions={[
        <Button
          ouiaId="resume-selected-modal-confirm-button"
          key="confirm"
          className="confirm-button"
          variant="primary"
          onClick={handleConfirm}
        >
          {__('Yes')}
        </Button>,

        <Button
          ouiaId="resume-selected-modal-cancel-button"
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
          'This will resume %(number)s task(s), putting them in the running state. Are you sure?'
        ),
        { number: selectedRowsLen }
      )}
    </Modal>
  );
};

ResumeSelectedModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
  uriQuery: PropTypes.object,
  parentTaskID: PropTypes.string,
};

ResumeSelectedModal.defaultProps = {
  uriQuery: {},
  parentTaskID: null,
};

export default ResumeSelectedModal;
