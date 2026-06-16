import React from 'react';
import { Icon } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  QuestionCircleIcon,
} from '@patternfly/react-icons';
import { translate as __ } from 'foremanReact/common/I18n';

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
      <Icon title={__('Running')}>
        <QuestionCircleIcon />
      </Icon>
    );
  }

  switch (result) {
    case 'success':
      return (
        <Icon status="success" title={__('Success')}>
          <CheckCircleIcon />
        </Icon>
      );
    case 'error':
      return (
        <Icon status="danger" title={__('Error')}>
          <ExclamationCircleIcon />
        </Icon>
      );
    case 'warning':
      return (
        <Icon status="warning" title={__('Warning')}>
          <ExclamationTriangleIcon />
        </Icon>
      );
    default:
      return (
        <Icon title={__('Unknown')}>
          <QuestionCircleIcon />
        </Icon>
      );
  }
};
