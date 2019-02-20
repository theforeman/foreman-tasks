import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { ButtonGroup, Button } from 'patternfly-react';

import routes from './Routes/ForemanTasksRoutes';
import ForemanTasksRouter from './Routes/ForemanTasksRouter';

const ForemanTasks = () => (
  <BrowserRouter>
    <div>
      <div style={{ paddingTop: '10px', paddingBottom: '10px' }}>
        <ButtonGroup bsSize="large">
          <LinkContainer to={routes.indexTasks.path}>
            <Button bsStyle="link">index-tasks-page</Button>
          </LinkContainer>
          <LinkContainer to={routes.showTask.path.replace(':id', 'some-id')}>
            <Button bsStyle="link">show-task-page</Button>
          </LinkContainer>
        </ButtonGroup>
      </div>
      <ForemanTasksRouter />
    </div>
  </BrowserRouter>
);

export default ForemanTasks;
