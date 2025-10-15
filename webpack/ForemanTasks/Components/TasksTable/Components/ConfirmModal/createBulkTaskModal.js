import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { sprintf } from 'foremanReact/common/I18n';
import {
  selectSelectedTasks,
  selectSelectedRowsLen,
} from './ConfirmModalSelectors';
import { selectAllRowsSelected } from '../../TasksTableSelectors';
import { GenericConfirmModal } from './GenericConfirmModal';

export const createBulkTaskModal = ({
  bulkActionBySearch,
  bulkActionById,
  title,
  messageTemplate,
  confirmButtonVariant = 'primary',
  ouiaIdPrefix,
}) => {
  const BulkTaskModal = ({
    isModalOpen,
    setIsModalOpen,
    url,
    uriQuery,
    parentTaskID,
  }) => {
    const allRowsSelected = useSelector(selectAllRowsSelected);
    const selectedTasks = useSelector(selectSelectedTasks);
    const selectedRowsLen = useSelector(selectSelectedRowsLen);

    const handleConfirm = () =>
      allRowsSelected
        ? bulkActionBySearch({ query: uriQuery, parentTaskID })
        : bulkActionById({
            selected: selectedTasks,
            url,
            parentTaskID,
          });

    return (
      <GenericConfirmModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        title={title}
        message={sprintf(messageTemplate, { number: selectedRowsLen })}
        onConfirm={handleConfirm}
        confirmButtonVariant={confirmButtonVariant}
        ouiaIdPrefix={ouiaIdPrefix}
      />
    );
  };

  BulkTaskModal.propTypes = {
    isModalOpen: PropTypes.bool.isRequired,
    setIsModalOpen: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    uriQuery: PropTypes.object,
    parentTaskID: PropTypes.string,
  };

  BulkTaskModal.defaultProps = {
    uriQuery: {},
    parentTaskID: null,
  };

  return BulkTaskModal;
};
