import React from 'react';
import PropTypes from 'prop-types';
import { capitalize } from 'lodash';
import { Stack, Text, TextVariants, Title } from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { translate as __ } from 'foremanReact/common/I18n';

const DependencyTable = ({ title, tasks, ouiaSectionId }) => (
  <Stack hasGutter>
    <Title headingLevel="h3" size="lg" ouiaId={`${ouiaSectionId}-title`}>
      {title}
    </Title>
    {tasks.length === 0 ? (
      <p className="text-muted">{__('None')}</p>
    ) : (
      <Table
        aria-label={title}
        variant="compact"
        ouiaId={`${ouiaSectionId}-table`}
        className="pf-v5-u-w-100-on-md pf-v5-u-w-66-on-xl"
      >
        <Thead>
          <Tr ouiaId={`${ouiaSectionId}-table-header`}>
            <Th>{__('Name')}</Th>
            <Th>{__('State')}</Th>
            <Th>{__('Result')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tasks.map(task => (
            <Tr key={task.id} ouiaId={`${ouiaSectionId}-table-row-${task.id}`}>
              <Td dataLabel={__('Name')}>
                <Text
                  component={TextVariants.a}
                  href={`/foreman_tasks/tasks/${task.id}`}
                  ouiaId={`${ouiaSectionId}-task-link-${task.id}`}
                >
                  {task.humanized || task.action}
                </Text>
              </Td>
              <Td dataLabel={__('State')}>
                {capitalize(String(task.state || ''))}
              </Td>
              <Td dataLabel={__('Result')}>
                {capitalize(String(task.result || ''))}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    )}
  </Stack>
);

DependencyTable.propTypes = {
  title: PropTypes.string.isRequired,
  tasks: PropTypes.array,
  ouiaSectionId: PropTypes.string.isRequired,
};

DependencyTable.defaultProps = {
  tasks: [],
};

const Dependencies = ({ dependsOn, blocks }) => (
  <Stack hasGutter>
    <DependencyTable
      title={__('Task depends on')}
      tasks={dependsOn}
      ouiaSectionId="task-dependencies-depends-on"
    />
    <DependencyTable
      title={__('Task blocks')}
      tasks={blocks}
      ouiaSectionId="task-dependencies-blocks"
    />
  </Stack>
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
