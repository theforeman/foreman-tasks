import React from 'react';
import PropTypes from 'prop-types';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Flex,
  FlexItem,
  Icon,
  Stack,
  Text,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { LockIcon, LockOpenIcon } from '@patternfly/react-icons';
import { translate as __, sprintf } from 'foremanReact/common/I18n';

const LocksSection = ({
  title,
  description,
  items,
  RowIcon,
  ouiaSectionId,
}) => (
  <Stack
    hasGutter
    className="pf-v5-u-mb-xl"
    data-ouia-component-id={ouiaSectionId}
  >
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      flexWrap={{ default: 'nowrap' }}
      gap={{ default: 'gapSm' }}
    >
      <Title headingLevel="h3" size="lg" ouiaId={`${ouiaSectionId}-title`}>
        {title}
      </Title>
      <RowIcon aria-hidden />
    </Flex>
    <p className="pf-v5-u-color-200 pf-v5-u-mb-0 pf-v5-u-font-size-md">
      {description}
    </p>
    <Stack hasGutter={false} className="pf-v5-u-w-25">
      {items.map((lock, key) => (
        <Flex
          key={`${lock.resource_type}-${lock.resource_id}-${key}`}
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          flexWrap={{ default: 'nowrap' }}
          gap={{ default: 'gapMd' }}
          className="pf-v5-u-py-sm pf-v5-u-px-md pf-v5-u-border-bottom"
          data-ouia-component-id={`${ouiaSectionId}-row-${key}`}
        >
          <FlexItem>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapSm' }}
              flexWrap={{ default: 'nowrap' }}
            >
              <Icon iconSize="sm">
                <RowIcon />
              </Icon>
              {lock.link ? (
                <Text
                  component={TextVariants.a}
                  href={lock.link}
                  ouiaId={`${ouiaSectionId}-resource-type-link-${key}`}
                >
                  {lock.resource_type}
                </Text>
              ) : (
                <span>{lock.resource_type}</span>
              )}
            </Flex>
          </FlexItem>
          <FlexItem>{sprintf(__('id: %s'), String(lock.resource_id))}</FlexItem>
        </Flex>
      ))}
    </Stack>
  </Stack>
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
      <div
        data-ouia-component-id="task-locks-empty"
        className="pf-v5-u-display-flex pf-v5-u-justify-content-center"
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
      </div>
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
