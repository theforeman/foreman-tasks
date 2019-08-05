import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Button } from 'patternfly-react';

const IndexTasks = () => (
  <div>
    <h1>Hello Foreman Tasks</h1>
    <h2>index-tasks-page</h2>
    <LinkContainer to="/foreman_tasks/ex_tasks/1">
      <Button bsStyle="primary">show-task-page</Button>
    </LinkContainer>
  </div>
);

export default IndexTasks;
