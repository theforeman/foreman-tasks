import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Button, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { translate as __ } from 'foremanReact/common/I18n';
import {
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS,
} from '../../../../TasksDashboardConstants';
import { queryPropType } from '../../../../TasksDashboardPropTypes';

export const OtherInfo = ({ updateQuery, otherCount, query }) => {
  const { OTHER } = TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS;
  const { STOPPED } = TASKS_DASHBOARD_AVAILABLE_QUERY_STATES;
  const active = query.state === STOPPED && query.result === OTHER;
  return (
    <span className={classNames(active && 'other-active')}>
      <Tooltip
        id="stopped-tooltip"
        content={__(
          'Other includes all stopped tasks that are cancelled or pending'
        )}
        position={TooltipPosition.bottom}
      >
        <span>
          <InfoCircleIcon className="pficon" />
          <span>{__('Other:')} </span>
        </span>
      </Tooltip>
      <Button
        variant="link"
        onClick={() =>
          updateQuery({
            state: STOPPED,
            result: OTHER,
          })
        }
      >
        {otherCount}
      </Button>
    </span>
  );
};
OtherInfo.propTypes = {
  updateQuery: PropTypes.func.isRequired,
  otherCount: PropTypes.number.isRequired,
  query: queryPropType.isRequired,
};
