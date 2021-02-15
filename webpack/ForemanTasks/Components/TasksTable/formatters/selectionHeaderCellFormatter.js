import React from 'react';
import TableSelectionHeaderCell from '../Components/TableSelectionHeaderCell';

export default (selectionController, label) => (
  <TableSelectionHeaderCell
    label={label}
    checked={selectionController.allPageSelected()}
    disabled
    onChange={selectionController.selectPage}
  />
);
