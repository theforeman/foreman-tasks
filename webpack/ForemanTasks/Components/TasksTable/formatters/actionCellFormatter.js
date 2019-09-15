import React from 'react';
import { cellFormatter } from 'foremanReact/components/common/table';
import { ActionButton } from '../../common/ActionButtons/ActionButton';

export const actionCellFormatter = taskActions => (
  value,
  { rowData: { action, id } }
) =>
  cellFormatter(
    <ActionButton
      id={id}
      name={action}
      taskActions={taskActions}
      availableActions={value}
    />
  );
