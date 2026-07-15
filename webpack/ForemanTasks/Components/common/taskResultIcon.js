import React from 'react';
import { Icon } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  QuestionCircleIcon,
  InProgressIcon,
} from '@patternfly/react-icons';
import { translate as __ } from 'foremanReact/common/I18n';

const RESULT_ICONS = {
  success: {
    status: 'success',
    title: () => __('Success'),
    IconComponent: CheckCircleIcon,
  },
  error: {
    status: 'danger',
    title: () => __('Error'),
    IconComponent: ExclamationCircleIcon,
  },
  warning: {
    status: 'warning',
    title: () => __('Warning'),
    IconComponent: ExclamationTriangleIcon,
  },
};

const UNKNOWN_RESULT_ICON = {
  status: undefined,
  title: () => __('Unknown'),
  IconComponent: QuestionCircleIcon,
};

/**
 * Icon reflecting task state/result (aligned with TaskInfo / tasks table).
 *
 * @param {string} state Dynflow task state (e.g. stopped, running).
 * @param {string} [result] Result when stopped (success, error, warning, …).
 * @param {boolean} isTitleIcon Whether the icon should be used as a title icon.
 * @returns {React.ReactElement}
 */
export const taskResultIconEl = (state, result, isTitleIcon = false) => {
  const size = isTitleIcon ? 'lg' : 'md';

  if (state && state !== 'stopped') {
    return (
      <Icon title={__('Running')} status="info" isInline size={size}>
        <InProgressIcon />
      </Icon>
    );
  }

  const { status, title, IconComponent } =
    RESULT_ICONS[result] || UNKNOWN_RESULT_ICON;

  return (
    <Icon title={title()} status={status} isInline size={size}>
      <IconComponent />
    </Icon>
  );
};
