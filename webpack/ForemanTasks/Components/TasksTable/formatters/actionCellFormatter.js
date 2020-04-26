import React from 'react';
import { translate as __ } from 'foremanReact/common/I18n';
import { cellFormatter } from 'foremanReact/components/common/table';
import { ActionButton } from '../../common/ActionButtons/ActionButton';

export const actionCellFormatter = modalActions => (
  availableActions,
  { rowData: { action, id } }
) => {
  let title;
  if (!availableActions.resumable && !availableActions.cancellable) {
    title = __('Task cannot be canceled');
  }
  return cellFormatter(
    <div title={title}>
      <ActionButton
        id={id}
        name={action}
        modalActions={modalActions}
        availableActions={availableActions}
      />
    </div>
  );
};
