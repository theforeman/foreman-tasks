import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Button } from 'patternfly-react';

const ShowTask = () => (
  <div>
    <h1>Hello Foreman Tasks</h1>
    <h2>show-task-page</h2>
    <LinkContainer to="/foreman_tasks/ex_tasks">
      <Button bsStyle="primary">show-tasks-page</Button>
    </LinkContainer>
  </div>
);

export default ShowTask;
