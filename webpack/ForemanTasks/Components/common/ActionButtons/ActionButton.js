import React from 'react';
import PropTypes from 'prop-types';
import { CancelButton } from './CancelButton';
import { ResumeButton } from './ResumeButton';

export const ActionButton = ({ id, name, availableActions, taskActions }) => {
  const isResume = availableActions.resumable;
  if (isResume) {
    return (
      <ResumeButton
        id={id}
        name={name}
        onClick={taskActions.resume}
        disabled={false}
      />
    );
  }
  return (
    <CancelButton
      id={id}
      name={name}
      disabled={!availableActions.cancellable}
      onClick={taskActions.cancel}
    />
  );
};

ActionButton.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  availableActions: PropTypes.shape({
    cancellable: PropTypes.bool,
    resumable: PropTypes.bool,
  }).isRequired,
  taskActions: PropTypes.shape({
    cancel: PropTypes.func,
    resume: PropTypes.func,
  }).isRequired,
};
