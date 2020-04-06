import React from 'react';
import { cellFormatter } from 'foremanReact/components/common/table';
import { ActionButton } from '../../common/ActionButtons/ActionButton';

export const actionCellFormatter = taskActions => (
  value,
  { rowData: { action, id, canEdit } }
) =>
  cellFormatter(
    canEdit && (
      <ActionButton
        canEdit={canEdit}
        id={id}
        name={action}
        taskActions={taskActions}
        availableActions={value}
      />
    )
  );
