import React from 'react';
import { cellFormatter } from 'foremanReact/components/common/table';
import { ActionButton } from '../../common/ActionButtons/ActionButton';

export const actionCellFormatter = modalActions => (
  value,
  { rowData: { action, id } }
) =>
  cellFormatter(
    <ActionButton
      id={id}
      name={action}
      modalActions={modalActions}
      availableActions={value}
    />
  );
