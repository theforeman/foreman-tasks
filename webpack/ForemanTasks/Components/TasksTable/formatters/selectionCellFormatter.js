import React from 'react';
import TableSelectionCell from '../Components/TableSelectionCell';

export default (selectionController, additionalData) => (
  <TableSelectionCell
    id={`select${additionalData.rowIndex}`}
    checked={selectionController.isSelected(additionalData)}
    onChange={() => selectionController.selectRow(additionalData)}
  />
);
