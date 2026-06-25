import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import TaskInfo from './TaskInfo';

const Task = props => (
  <Stack hasGutter>
    <StackItem>
      <TaskInfo {...props} />
    </StackItem>
  </Stack>
);

export default Task;
