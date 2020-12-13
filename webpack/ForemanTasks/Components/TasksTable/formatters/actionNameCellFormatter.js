import React from 'react';
import { cellFormatter } from 'foremanReact/components/common/table';
import EllipsisWithTooltip from 'react-ellipsis-with-tooltip';

export const actionNameCellFormatter = url => (value, { rowData: { id } }) =>
  cellFormatter(
    <a href={`/${url}/${id}`}>
      <EllipsisWithTooltip>{value}</EllipsisWithTooltip>
    </a>
  );
