import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Flex,
  Icon,
  Text,
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
  <Card isPlain className="pf-v5-u-mb-xl" ouiaId={ouiaSectionId}>
    <CardHeader>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        flexWrap={{ default: 'nowrap' }}
        gap={{ default: 'gapSm' }}
      >
        <Title
          headingLevel="h3"
          size="lg"
          ouiaId={`${ouiaSectionId}-title`}
          className="pf-v5-u-m-0"
        >
          {title}
        </Title>
        <RowIcon aria-hidden />
      </Flex>
    </CardHeader>
    <CardBody>
      <p className="pf-v5-u-color-200 pf-v5-u-mb-md pf-v5-u-font-size-md">
        {description}
      </p>
      <Table
        aria-label={title}
        variant="compact"
        ouiaId={`${ouiaSectionId}-table`}
        className="pf-v5-u-w-100-on-sm pf-v5-u-w-75-on-md pf-v5-u-w-50-on-lg pf-v5-u-w-33-on-xl"
      >
        <Tbody>
          {items.map((lock, key) => (
            <Tr
              key={`${lock.resource_type}-${lock.resource_id}-${key}`}
              ouiaId={`${ouiaSectionId}-row-${key}`}
            >
              <Td
                className="pf-v5-u-min-w-0 pf-v5-u-py-sm pf-v5-u-pl-md"
                width={80}
              >
                <Flex
                  component="span"
                  display={{ default: 'inlineFlex' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                  flexWrap={{ default: 'nowrap' }}
                  gap={{ default: 'gapSm' }}
                  className="pf-v5-u-min-w-0"
                >
                  <Icon iconSize="sm" className="pf-v5-u-flex-shrink-0">
                    <RowIcon />
                  </Icon>
                  {lock.link ? (
                    <Text
                      className="pf-v5-u-text-truncate"
                      component={TextVariants.a}
                      href={lock.link}
                      ouiaId={`${ouiaSectionId}-resource-type-link-${key}`}
                    >
                      {lock.resource_type}
                    </Text>
                  ) : (
                    <span className="pf-v5-u-text-truncate pf-v5-u-display-block">
                      {lock.resource_type}
                    </span>
                  )}
                </Flex>
              </Td>
              <Td
                modifier="nowrap"
                width={20}
                className="pf-v5-u-py-sm pf-v5-u-pl-md pf-v5-u-pr-md pf-v5-u-text-align-left"
              >
                {sprintf(__('id: %s'), String(lock.resource_id))}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </CardBody>
  </Card>
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
      <Flex
        data-ouia-component-id="task-locks-empty"
        justifyContent={{ default: 'justifyContentCenter' }}
      >
        <EmptyState className="pf-v5-u-w-50 pf-v5-u-pl-0 pf-v5-u-pr-0">
          <EmptyStateHeader
            headingLevel="h2"
            titleText={__('No resources')}
            icon={<EmptyStateIcon icon={LockOpenIcon} />}
          />
          <EmptyStateBody>
            {__(
              'No resources currently associated with this task. Locking resources prevents conflicting tasks from running simultaneously. Other tasks must wait until this process completes.'
            )}
          </EmptyStateBody>
        </EmptyState>
      </Flex>
    );
  }

  return (
    <div data-ouia-component-id="task-locks-populated">
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
    </div>
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
