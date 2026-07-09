import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ClipboardCopy,
  ExpandableSection,
  ExpandableSectionToggle,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Progress,
  ProgressVariant,
  Split,
  SplitItem,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import capitalize from 'lodash/capitalize';
import { translate as __, sprintf } from 'foremanReact/common/I18n';
import RelativeDateTime from 'foremanReact/components/common/dates/RelativeDateTime';

import { taskResultIconEl } from '../../common/taskResultIcon';
import {
  formatTaskDuration,
  isDelayed,
  parseUsernameLinkHref,
} from './TaskHelper';

const formatResultLabel = result => {
  if (!result || typeof result !== 'string') {
    return __('N/A');
  }

  return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
};

const progressVariant = result => {
  switch (result) {
    case 'error':
      return ProgressVariant.danger;
    case 'success':
      return ProgressVariant.success;
    case 'warning':
      return ProgressVariant.warning;
    default:
      return undefined;
  }
};

const MetadataField = ({ title, value, className, labelOuiaId, span }) => (
  <GridItem
    {...(span ? { span } : { xl: 2, lg: 4, md: 6, sm: 12 })}
    className={className}
  >
    <Flex
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsXs' }}
    >
      <FlexItem>
        <Text ouiaId={labelOuiaId} component={TextVariants.small}>
          {title}
        </Text>
      </FlexItem>
      <FlexItem>{value}</FlexItem>
    </Flex>
  </GridItem>
);

MetadataField.propTypes = {
  title: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  className: PropTypes.string,
  labelOuiaId: PropTypes.string.isRequired,
  span: PropTypes.number,
};

MetadataField.defaultProps = {
  className: undefined,
  span: undefined,
};

const copyableText = text =>
  text ? (
    <ClipboardCopy
      variant="inline-compact"
      hoverTip={__('Copy')}
      clickTip={__('Copied')}
    >
      {text}
    </ClipboardCopy>
  ) : (
    __('N/A')
  );

const TaskInfo = props => {
  const {
    action,
    endedAt,
    externalId,
    id,
    label,
    result,
    startAt,
    startedAt,
    startBefore,
    state,
    help,
    progress,
    username,
    usernamePath,
  } = props;

  const [isExpanded, setIsExpanded] = useState(false);
  const baseId = id || 'task-info';
  const contentId = `${baseId}-more-details-content`;
  const toggleId = `${baseId}-more-details-toggle`;

  const usernameHref = parseUsernameLinkHref(usernamePath)?.startsWith('/')
    ? parseUsernameLinkHref(usernamePath)
    : null;
  const triggeredBy = usernameHref ? (
    <a href={usernameHref}>{username}</a>
  ) : (
    username || ''
  );

  const progVariant = progressVariant(result);

  return (
    <Grid className="task-details-overview" hasGutter>
      <MetadataField
        labelOuiaId="task-info-metadata-result-label"
        title={__('Result')}
        value={
          <>
            {taskResultIconEl(state, result)}
            <span> {formatResultLabel(result)}</span>
          </>
        }
      />
      <MetadataField
        labelOuiaId="task-info-metadata-state-label"
        title={__('State')}
        value={capitalize(state) || __('N/A')}
      />
      <MetadataField
        labelOuiaId="task-info-metadata-started-at-label"
        title={__('Started at')}
        value={<RelativeDateTime defaultValue={__('N/A')} date={startedAt} />}
      />
      <MetadataField
        labelOuiaId="task-info-metadata-duration-label"
        title={__('Duration')}
        value={formatTaskDuration(startedAt, endedAt, state)}
      />
      <MetadataField
        labelOuiaId="task-info-metadata-triggered-by-label"
        title={__('Triggered by')}
        value={triggeredBy}
      />
      <MetadataField
        labelOuiaId="task-info-metadata-id-label"
        title={__('Id')}
        value={copyableText(id)}
      />

      <GridItem span={12}>
        <ExpandableSectionToggle
          toggleId={toggleId}
          contentId={contentId}
          isExpanded={isExpanded}
          onToggle={setIsExpanded}
        >
          {isExpanded ? __('Show less details') : __('Show more details')}
        </ExpandableSectionToggle>
      </GridItem>

      <GridItem span={12}>
        <ExpandableSection
          isExpanded={isExpanded}
          isDetached
          toggleId={toggleId}
          contentId={contentId}
        >
          <Grid hasGutter>
            <MetadataField
              labelOuiaId="task-info-metadata-execution-type-label"
              title={__('Execution type')}
              value={__(isDelayed(props) ? 'Delayed' : 'Immediate')}
            />
            <MetadataField
              labelOuiaId="task-info-metadata-label-field-label"
              title={__('Label')}
              value={label || action || __('N/A')}
              className="details-name"
            />
            <MetadataField
              labelOuiaId="task-info-metadata-start-at-label"
              title={__('Start at')}
              value={
                <Flex direction={{ default: 'column' }}>
                  <FlexItem>
                    <RelativeDateTime defaultValue={__('N/A')} date={startAt} />
                  </FlexItem>
                  {startBefore && (
                    <FlexItem>
                      <span>({__('before')} </span>
                      <RelativeDateTime
                        defaultValue={__('N/A')}
                        date={startBefore}
                      />
                      <span>)</span>
                    </FlexItem>
                  )}
                </Flex>
              }
            />
            <MetadataField
              labelOuiaId="task-info-metadata-ended-at-label"
              title={__('Ended at')}
              value={
                <RelativeDateTime defaultValue={__('N/A')} date={endedAt} />
              }
            />
            <MetadataField
              labelOuiaId="task-info-metadata-external-id-label"
              title={__('External Id')}
              value={copyableText(externalId)}
            />
            {help && (
              <MetadataField
                labelOuiaId="task-info-metadata-help-text-label"
                title={__('Troubleshooting')}
                span={12}
                value={<p dangerouslySetInnerHTML={{ __html: help }} />}
              />
            )}
          </Grid>
        </ExpandableSection>
      </GridItem>

      {state !== 'stopped' && (
        <GridItem span={12}>
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsXs' }}
          >
            <FlexItem>
              <Split hasGutter>
                <SplitItem isFilled>
                  <Text
                    component={TextVariants.p}
                    ouiaId="task-info-running-state-summary"
                  >
                    {capitalize(state)}
                  </Text>
                </SplitItem>
                <SplitItem>
                  <Text
                    component={TextVariants.p}
                    ouiaId="task-info-running-progress-complete-text"
                  >
                    {sprintf(__('%s%% Complete'), progress)}
                  </Text>
                </SplitItem>
              </Split>
            </FlexItem>
            <FlexItem>
              <Progress
                value={progress}
                max={100}
                aria-label={sprintf(__('%s%% Complete'), progress)}
                measureLocation="outside"
                {...(progVariant ? { variant: progVariant } : {})}
              />
            </FlexItem>
          </Flex>
        </GridItem>
      )}
    </Grid>
  );
};

TaskInfo.propTypes = {
  action: PropTypes.string,
  endedAt: PropTypes.string,
  externalId: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  result: PropTypes.string,
  startAt: PropTypes.string,
  startBefore: PropTypes.string,
  startedAt: PropTypes.string,
  state: PropTypes.string,
  help: PropTypes.string,
  progress: PropTypes.number,
  username: PropTypes.string,
  usernamePath: PropTypes.string,
};

TaskInfo.defaultProps = {
  action: '',
  endedAt: '',
  externalId: '',
  id: '',
  label: '',
  result: 'error',
  startAt: '',
  startBefore: '',
  startedAt: '',
  state: '',
  help: '',
  progress: 0,
  username: '',
  usernamePath: '',
};

export default TaskInfo;
