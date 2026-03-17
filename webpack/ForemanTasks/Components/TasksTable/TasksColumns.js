import React from 'react';
import LongDateTime from 'foremanReact/components/common/dates/LongDateTime';
import { translate as __ } from 'foremanReact/common/I18n';
import { getDuration } from './TasksTableHelpers';
import {
  CANCEL_MODAL,
  RESUME_MODAL,
  FORCE_UNLOCK_MODAL,
} from './TasksTableConstants';

export const columns = {
  select: {},
  action: {
    title: __('Action'),
    wrapper: ({ id, action }) => (
      <a href={`/foreman_tasks/tasks/${id}`}>{action}</a>
    ),
  },
  state: {
    title: __('State'),
  },
  result: {
    title: __('Result'),
  },
  started_at: {
    title: __('Started at'),
    isSorted: true,
    wrapper: ({ started_at: startedAt }) => (
      <LongDateTime seconds date={startedAt} defaultValue={__('N/A')} />
    ),
  },
  duration: {
    title: __('Duration'),
    isSorted: true,
    wrapper: ({ started_at: startedAt, ended_at: endedAt }) => {
      const duration = getDuration(startedAt, endedAt);
      return (
        <span className="param-value" title={duration.tooltip}>
          {duration.text}
        </span>
      );
    },
  },
};

export const getRowKebabItems = (setClickedTask, openModal) => ({
  id,
  action,
  canEdit,
  available_actions: { resumable, cancellable },
  state,
}) => {
  const stoppable = state !== 'stopped';
  const items = [];
  if (!canEdit) return items;

  if (cancellable) {
    items.push({
      title: __('Cancel'),
      onClick: () => {
        setClickedTask({ id, action });
        openModal(CANCEL_MODAL);
      },
    });
  }
  if (resumable) {
    items.push({
      title: __('Resume'),
      onClick: () => {
        setClickedTask({ id, action });
        openModal(RESUME_MODAL);
      },
    });
  }
  if (stoppable) {
    items.push({
      title: __('Force Cancel'),
      onClick: () => {
        setClickedTask({ id, action });
        openModal(FORCE_UNLOCK_MODAL);
      },
    });
  }
  return items;
};
