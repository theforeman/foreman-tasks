import React from 'react';
import LongDateTime from 'foremanReact/components/common/dates/LongDateTime';
import { translate as __ } from 'foremanReact/common/I18n';
import { getDuration } from './TasksTableHelpers';
import { CellActionButton } from './Components/CellActionButton';

export const columns = (setClickedTask, openModal, canEdit) => ({
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
  action_button: {
    title: __('Action'),
    wrapper: ({ id, action, available_actions: availableActions, state }) => (
      <CellActionButton
        id={id}
        action={action}
        canEdit={canEdit}
        availableActions={availableActions}
        cancellable={availableActions.cancellable}
        resumable={availableActions.resumable}
        stoppable={state !== 'stopped'}
        setClickedTask={setClickedTask}
        openModal={openModal}
      />
    ),
  },
});
