import React from 'react';
import { Icon } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  QuestionCircleIcon,
} from '@patternfly/react-icons';

/**
 * Icon reflecting task state/result (aligned with TaskInfo / tasks table).
 *
 * @param {string} state Dynflow task state (e.g. stopped, running).
 * @param {string} [result] Result when stopped (success, error, warning, …).
 * @returns {React.ReactElement}
 */
export const taskResultIconEl = (state, result) => {
  if (state !== 'stopped') {
    return (
      <Icon>
        <QuestionCircleIcon />
      </Icon>
    );
  }

  switch (result) {
    case 'success':
      return (
        <Icon status="success">
          <CheckCircleIcon />
        </Icon>
      );
    case 'error':
      return (
        <Icon status="danger">
          <ExclamationCircleIcon />
        </Icon>
      );
    case 'warning':
      return (
        <Icon status="warning">
          <ExclamationTriangleIcon />
        </Icon>
      );
    default:
      return (
        <Icon>
          <QuestionCircleIcon />
        </Icon>
      );
  }
};
