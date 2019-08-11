import React from 'react';
import { capitalize } from 'lodash';
import classNames from 'classnames';
import { Icon, Button } from 'patternfly-react';
import {
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_MODES,
} from '../../../../TasksDashboardConstants';

const resultIcons = {
  error: <Icon type="pf" name="error-circle-o" />,
  warning: <Icon type="pf" name="warning-triangle-o" />,
  success: <Icon type="pf" name="ok" />,
};

export const StoppedTable = (data, query, time, updateQuery) =>
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
      <tr key={result}>
        <td>
          {resultIcons[result]}
          {capitalize(result)}
        </td>
        <td
          className={classNames('data-col', {
            active: active && mode !== LAST,
            'not-focused': notFocusedTotal,
          })}
          onClick={() => updateQuery({ state: STOPPED, result })}
        >
          <Button bsStyle="link">{total}</Button>
        </td>
        <td
          className={classNames('data-col', {
            active: activeLast,
            'not-focused': notFocusedLast,
          })}
          onClick={() =>
            updateQuery({
              state: STOPPED,
              result,
              mode: LAST,
              time,
            })
          }
        >
          <Button bsStyle="link">{last}</Button>
        </td>
      </tr>
    );
  });
