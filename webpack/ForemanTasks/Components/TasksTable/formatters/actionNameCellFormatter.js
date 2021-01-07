import React from 'react';
import { cellFormatter } from 'foremanReact/components/common/table';

export const actionNameCellFormatter = url => (value, { rowData: { id } }) =>
  cellFormatter(
    <a href={`/${url}/${id}`} className="action-name-tasks-table">
      {value}
    </a>
  );
