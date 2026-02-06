import React from 'react';
import PropTypes from 'prop-types';
import { capitalize } from 'lodash';
import classNames from 'classnames';
import { Icon, Button } from '@patternfly/react-core';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from '@patternfly/react-icons';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { translate as __ } from 'foremanReact/common/I18n';
import {
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_MODES,
} from '../../../../TasksDashboardConstants';
import { getQueryValueText } from '../../../../TasksDashboardHelper';
import {
  timePropType,
  queryPropType,
} from '../../../../TasksDashboardPropTypes';

const resultIcons = {
  error: (
    <Icon status="danger" size="sm">
      <ExclamationCircleIcon />
    </Icon>
  ),
  warning: (
    <Icon status="warning" size="sm">
      <ExclamationTriangleIcon />
    </Icon>
  ),
  success: (
    <Icon status="success" size="sm">
      <CheckIcon />
    </Icon>
  ),
};

const StoppedTableCells = (data, query, time, updateQuery) =>
  Object.entries(data).map(([result, { total, last }]) => {
    const { STOPPED } = TASKS_DASHBOARD_AVAILABLE_QUERY_STATES;
    const { LAST } = TASKS_DASHBOARD_AVAILABLE_QUERY_MODES;
    const { state, mode } = query;

    const active = state === STOPPED && query.result === result;
    const activeTotal = active && mode !== LAST;
    const activeLast = active && mode === LAST && query.time === time;
    const notFocusedTotal =
      state && !(state === STOPPED && !query.result) && !activeTotal;
    const notFocusedLast =
      state && !(state === STOPPED && !query.result) && !activeLast;

    return (
      <Tr key={result} ouiaId={`stopped-table-row-${result}`}>
        <Td dataLabel={__('Result')}>
          {resultIcons[result]} {capitalize(result)}
        </Td>
        <Td
          dataLabel={__('Total')}
          className={classNames('data-col', {
            active: active && mode !== LAST,
            'not-focused': notFocusedTotal,
          })}
        >
          <Button
            ouiaId={`stopped-table-button-${result}-total`}
            variant="link"
            onClick={() => updateQuery({ state: STOPPED, result })}
          >
            {total}
          </Button>
        </Td>
        <Td
          dataLabel={getQueryValueText(time)}
          className={classNames('data-col', {
            active: activeLast,
            'not-focused': notFocusedLast,
          })}
        >
          <Button
            ouiaId={`stopped-table-button-${result}-${time}`}
            onClick={() =>
              updateQuery({
                state: STOPPED,
                result,
                mode: LAST,
                time,
              })
            }
            variant="link"
          >
            {last}
          </Button>
        </Td>
      </Tr>
    );
  });

export const StoppedTable = ({ data, query, time, updateQuery }) => (
  <Table
    ouiaId="stopped-table"
    className="stopped-table"
    variant="compact"
    isStriped
    aria-label={__('Stopped tasks by result')}
  >
    <Thead>
      <Tr ouiaId="stopped-table-header">
        <Th aria-label={__('Result')} />
        <Th aria-label={__('Total')}>{__('Total')}</Th>
        <Th aria-label={getQueryValueText(time)}>{getQueryValueText(time)}</Th>
      </Tr>
    </Thead>
    <Tbody>{StoppedTableCells(data, query, time, updateQuery)}</Tbody>
  </Table>
);

StoppedTable.propTypes = {
  data: PropTypes.object.isRequired,
  query: queryPropType.isRequired,
  time: timePropType.isRequired,
  updateQuery: PropTypes.func.isRequired,
};
