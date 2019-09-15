import React from 'react';
import { FormattedDate } from 'react-intl';
import { isoCompatibleDate } from 'foremanReact/common/helpers';
import { translate as __ } from 'foremanReact/common/I18n';
import EllipsisWithTooltip from 'react-ellipsis-with-tooltip';
import { cellFormatter } from 'foremanReact/components/common/table';
import { ActionButton } from '../common/ActionButtons/ActionButton';

export const dateCellFormmatter = value => {
  if (value) {
    const isoDate = isoCompatibleDate(value);
    return (
      <span>
        <FormattedDate
          value={isoDate}
          day="2-digit"
          month="long"
          hour="2-digit"
          minute="2-digit"
          second="2-digit"
          year="numeric"
        />
      </span>
    );
  }
  return <span>{__('N/A')}</span>;
};

export const actionNameCellFormatter = url => (value, { rowData: { id } }) =>
  cellFormatter(
    <EllipsisWithTooltip>
      <a href={`/${url}/${id}`}>{value}</a>
    </EllipsisWithTooltip>
  );

export const actionCellFormatter = taskActions => (
  value,
  { rowData: { action, id } }
) =>
  cellFormatter(
    <ActionButton
      taskActions={taskActions}
      availableActions={value}
      id={id}
      name={action}
    />
  );
