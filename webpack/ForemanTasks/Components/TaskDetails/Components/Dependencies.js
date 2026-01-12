import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertVariant,
  Grid,
  GridItem,
  List,
  ListItem,
  Title,
} from '@patternfly/react-core';
import { translate as __ } from 'foremanReact/common/I18n';

const DependencyList = ({ title, tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div>
        <Title headingLevel="h4" size="md">
          {title}
        </Title>
        <p className="text-muted">{__('None')}</p>
      </div>
    );
  }

  return (
    <div>
      <Title headingLevel="h4" size="md">
        {title}
      </Title>
      <List isPlain>
        {tasks.map((task, index) => (
          <ListItem key={index}>
            <a href={`/foreman_tasks/tasks/${task.id}`}>
              {task.humanized || task.action}
            </a>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

DependencyList.propTypes = {
  title: PropTypes.string.isRequired,
  tasks: PropTypes.array,
};

DependencyList.defaultProps = {
  tasks: [],
};

const Dependencies = ({ dependsOn, blocks }) => (
  <div>
    <Alert variant={AlertVariant.info} isInline title={__('Task dependencies')}>
      {__(
        'This task may have dependencies on other tasks or may be blocking other tasks from executing. Dependencies are established through task chaining relationships.'
      )}
    </Alert>
    <br />
    <Grid hasGutter>
      <GridItem span={6}>
        <DependencyList title={__('Depends on')} tasks={dependsOn} />
      </GridItem>
      <GridItem span={6}>
        <DependencyList title={__('Blocks')} tasks={blocks} />
      </GridItem>
    </Grid>
  </div>
);

Dependencies.propTypes = {
  dependsOn: PropTypes.array,
  blocks: PropTypes.array,
};

Dependencies.defaultProps = {
  dependsOn: [],
  blocks: [],
};

export default Dependencies;
