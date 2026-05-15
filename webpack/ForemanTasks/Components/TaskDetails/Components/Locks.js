import React from 'react';
import PropTypes from 'prop-types';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Icon,
  Text,
  TextContent,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { Table, Tbody, Tr, Td } from '@patternfly/react-table';
import { LockIcon, LockOpenIcon } from '@patternfly/react-icons';
import { translate as __, sprintf } from 'foremanReact/common/I18n';

const LocksSection = ({
  title,
  description,
  items,
  RowIcon,
  ouiaSectionId,
}) => (
  <Flex direction={{ default: 'column' }}>
    <FlexItem spacer={{ default: 'spacerSm' }}>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <FlexItem>
          <Title
            headingLevel="h3"
            size="lg"
            style={{ margin: '0' }}
            ouiaId={`${ouiaSectionId}-title`}
          >
            {title}
          </Title>
        </FlexItem>
        <FlexItem>
          <RowIcon aria-hidden />
        </FlexItem>
      </Flex>
    </FlexItem>
    <FlexItem>
      <TextContent>
        <Text
          component={TextVariants.p}
          ouiaId={`${ouiaSectionId}-description`}
        >
          {description}
        </Text>
      </TextContent>
    </FlexItem>
    <FlexItem>
      <Grid>
        <GridItem span={5}>
          <Table
            aria-label={title}
            variant="compact"
            ouiaId={`${ouiaSectionId}-table`}
          >
            <Tbody>
              {items.map((lock, index) => (
                <Tr
                  key={`${lock.resource_type}-${lock.resource_id}-${index}`}
                  ouiaId={`${ouiaSectionId}-row-${index}`}
                >
                  <Td>
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      spaceItems={{ default: 'spaceItemsSm' }}
                      flexWrap={{ default: 'nowrap' }}
                    >
                      <FlexItem>
                        <Icon size="sm">
                          <RowIcon />
                        </Icon>
                      </FlexItem>
                      <FlexItem>
                        {lock.link ? (
                          <a
                            href={lock.link}
                            data-ouia-component-id={`${ouiaSectionId}-resource-type-link-${index}`}
                          >
                            {lock.resource_type}
                          </a>
                        ) : (
                          lock.resource_type
                        )}
                      </FlexItem>
                    </Flex>
                  </Td>
                  <Td>{sprintf(__('id: %s'), String(lock.resource_id))}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </GridItem>
      </Grid>
    </FlexItem>
  </Flex>
);

LocksSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  RowIcon: PropTypes.elementType.isRequired,
  ouiaSectionId: PropTypes.string.isRequired,
};

const Locks = ({ locks }) => {
  const nonExclusive = locks.filter(l => !l.exclusive);
  const exclusive = locks.filter(l => l.exclusive);

  if (locks.length === 0) {
    return (
      <EmptyState variant={EmptyStateVariant.lg}>
        <EmptyStateHeader
          headingLevel="h3"
          titleText={__('No resources')}
          icon={<EmptyStateIcon icon={LockOpenIcon} />}
        />
        <EmptyStateBody>
          {__(
            'No resources currently associated with this task. Locking resources prevents conflicting tasks from running simultaneously. Other tasks must wait until this process completes.'
          )}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Flex
      direction={{ default: 'column' }}
      gap={{ default: 'gap2xl' }}
      data-ouia-component-id="task-locks-populated"
    >
      {nonExclusive.length > 0 && (
        <LocksSection
          title={__('Non-exclusive resources')}
          description={__(
            "Other tasks can access the resource simultaneously. This lock tracks the task's relationship to the resource without blocking others."
          )}
          items={nonExclusive}
          RowIcon={LockOpenIcon}
          ouiaSectionId="task-locks-non-exclusive"
        />
      )}
      {exclusive.length > 0 && (
        <LocksSection
          title={__('Exclusive resources')}
          description={__(
            'Only this task can access the resource. Other tasks must wait until this process completes.'
          )}
          items={exclusive}
          RowIcon={LockIcon}
          ouiaSectionId="task-locks-exclusive"
        />
      )}
    </Flex>
  );
};

const lockShape = PropTypes.shape({
  exclusive: PropTypes.bool,
  resource_type: PropTypes.string,
  resource_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  link: PropTypes.string,
});

Locks.propTypes = {
  locks: PropTypes.arrayOf(lockShape),
};

Locks.defaultProps = {
  locks: [],
};

export default Locks;
