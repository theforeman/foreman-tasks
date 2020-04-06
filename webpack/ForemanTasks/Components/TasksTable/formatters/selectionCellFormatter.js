import React from 'react';
import { translate as __ } from 'foremanReact/common/I18n';
import TableSelectionCell from '../Components/TableSelectionCell';

export default (selectionController, additionalData) => (
  <TableSelectionCell
    id={`select${additionalData.rowIndex}`}
    disabled={!additionalData.rowData.canEdit}
    title={
      additionalData.rowData.canEdit
        ? undefined
        : __('You do not have permission')
    }
    checked={selectionController.isSelected(additionalData)}
    onChange={() => selectionController.selectRow(additionalData)}
  />
);
