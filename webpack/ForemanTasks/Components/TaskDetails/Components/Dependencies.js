import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertVariant,
  Grid,
  GridItem,
  Title,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { translate as __ } from 'foremanReact/common/I18n';

const DependencyTable = ({ title, tasks }) => {
  const tableId = title.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      <Title headingLevel="h4" size="md" ouiaId={`${tableId}-title`}>
        {title}
      </Title>
      {tasks.length === 0 ? (
        <p className="text-muted">{__('None')}</p>
      ) : (
        <Table aria-label={title} variant="compact" ouiaId={`${tableId}-table`}>
          <Thead>
            <Tr ouiaId={`${tableId}-table-header`}>
              <Th width={50}>{__('Action')}</Th>
              <Th width={25}>{__('State')}</Th>
              <Th width={25}>{__('Result')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tasks.map(task => (
              <Tr key={task.id} ouiaId={`${tableId}-table-row-${task.id}`}>
                <Td>
                  <a href={`/foreman_tasks/tasks/${task.id}`}>
                    {task.humanized || task.action}
                  </a>
                </Td>
                <Td>{task.state}</Td>
                <Td>{task.result}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
};

DependencyTable.propTypes = {
  title: PropTypes.string.isRequired,
  tasks: PropTypes.array,
};

DependencyTable.defaultProps = {
  tasks: [],
};

const Dependencies = ({ dependsOn, blocks }) => (
  <div>
    <Alert
      variant={AlertVariant.info}
      isInline
      title={__('Task dependencies')}
      ouiaId="task-dependencies-info-alert"
    >
      {__(
        'This task may have dependencies on other tasks or may be blocking other tasks from executing. Dependencies are established through task chaining relationships.'
      )}
    </Alert>
    <br />
    <Grid hasGutter>
      <GridItem span={6}>
        <DependencyTable title={__('Depends on')} tasks={dependsOn} />
      </GridItem>
      <GridItem span={6}>
        <DependencyTable title={__('Blocks')} tasks={blocks} />
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
