import React from 'react';
import PropTypes from 'prop-types';
import { sprintf } from 'foremanReact/common/I18n';
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
    uriQuery,
    parentTaskID,
    selectAllOptions,
    reloadPage,
  }) => {
    const {
      selectedCount = 0,
      areAllRowsSelected = () => false,
      selectedResults = [],
    } = selectAllOptions;
    const allRowsSelected = areAllRowsSelected();
    const selectedTasks = selectedResults;
    const selectedRowsLen = selectedCount;
    const handleConfirm = () =>
      allRowsSelected
        ? bulkActionBySearch({ query: uriQuery, parentTaskID })
        : bulkActionById({ selected: selectedTasks, reloadPage });

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
    uriQuery: PropTypes.string,
    parentTaskID: PropTypes.string,
    selectAllOptions: PropTypes.object.isRequired,
    reloadPage: PropTypes.func.isRequired,
  };

  BulkTaskModal.defaultProps = {
    uriQuery: {},
    parentTaskID: null,
  };

  return BulkTaskModal;
};
