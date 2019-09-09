import React from 'react';
import { FormattedDate } from 'react-intl';
import { isoCompatibleDate } from 'foremanReact/common/helpers';
import { translate as __ } from 'foremanReact/common/I18n';
import EllipsisWithTooltip from 'react-ellipsis-with-tooltip';
import { cellFormatter } from 'foremanReact/components/common/table';
import { Cancel } from '../common/Cancel/Cancel';

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

export const actionCellFormatter = url => (value, { rowData: { id } }) =>
  cellFormatter(
    <EllipsisWithTooltip>
      <a href={`/${url}/${id}`}>{value}</a>
    </EllipsisWithTooltip>
  );

export const cancelCellFormatter = cancelTaskAction => (
  value,
  { rowData: { action, id } }
) =>
  cellFormatter(
    <Cancel
      id={id}
      name={action}
      cancellable={value}
      cancelTaskAction={cancelTaskAction}
    />
  );
