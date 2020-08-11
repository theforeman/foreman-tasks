import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Icon, Button, OverlayTrigger, Tooltip } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';
import {
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS,
} from '../../../../TasksDashboardConstants';
import { queryPropType } from '../../../../TasksDashboardPropTypes';

const tooltip = (
  <Tooltip id="stopped-tooltip">
    {__('Other includes all stopped tasks that are cancelled or pending')}
  </Tooltip>
);

export const OtherInfo = ({ updateQuery, otherCount, query }) => {
  const { OTHER } = TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS;
  const { STOPPED } = TASKS_DASHBOARD_AVAILABLE_QUERY_STATES;
  const active = query.state === STOPPED && query.result === OTHER;
  return (
    <span className={classNames(active && 'other-active')}>
      <OverlayTrigger
        overlay={tooltip}
        trigger={['hover', 'focus']}
        placement="bottom"
      >
        <span>
          <Icon type="pf" name="info" />
          <span>{__('Other:')} </span>
        </span>
      </OverlayTrigger>
      <Button
        bsStyle="link"
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
