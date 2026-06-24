import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  GridItem,
  Progress,
  ProgressVariant,
} from '@patternfly/react-core';
import { translate as __ } from 'foremanReact/common/I18n';
import RelativeDateTime from 'foremanReact/components/common/dates/RelativeDateTime';

import { taskResultIconEl } from '../../common/taskResultIcon';

const isDelayed = ({ startAt, startedAt }) => {
  if (
    startAt == null ||
    startedAt == null ||
    startAt === '' ||
    startedAt === ''
  ) {
    return false;
  }
  const a = new Date(startAt);
  const b = new Date(startedAt);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
    return false;
  }
  a.setMilliseconds(0);
  b.setMilliseconds(0);
  return a.getTime() !== b.getTime();
};

const progressVariantForResult = result => {
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

const TaskInfo = props => {
  const {
    action,
    endedAt,
    result,
    startAt,
    startBefore,
    startedAt,
    state,
    help,
    output,
    progress,
    username,
    usernamePath,
  } = props;

  const details = [
    [
      {
        title: 'Name',
        value: action || __('N/A'),
        className: 'details-name',
      },
      {
        title: 'Start at',
        value: <RelativeDateTime defaultValue={__('N/A')} date={startAt} />,
      },
    ],
    [
      {
        title: 'Result',
        value: (
          <span>
            {taskResultIconEl(state, result)} {result}
          </span>
        ),
      },
      {
        title: 'Started at',
        value: <RelativeDateTime defaultValue={__('N/A')} date={startedAt} />,
      },
    ],
    [
      {
        title: 'Triggered by',
        value: (usernamePath || '').includes('href') ? (
          <a href={usernamePath.split('"')[1]}>{username}</a>
        ) : (
          username || ''
        ),
      },
      {
        title: 'Ended at',
        value: <RelativeDateTime defaultValue={__('N/A')} date={endedAt} />,
      },
    ],
    [
      {
        title: 'Execution type',
        value: __(isDelayed(props) ? 'Delayed' : 'Immediate'),
      },
      {
        title: 'Start before',
        value: startBefore ? (
          <RelativeDateTime defaultValue={__('N/A')} date={startBefore} />
        ) : (
          '-'
        ),
      },
    ],
  ];

  const progVariant = progressVariantForResult(result);

  return (
    <Grid>
      <GridItem span={12} className="pf-v5-u-pb-lg" />
      {details.map((items, key) => (
        <React.Fragment key={key}>
          <GridItem md={2} sm={6}>
            <span className="list-group-item-heading">
              {__(items[0].title)}:
            </span>
          </GridItem>
          <GridItem md={5} sm={6} className={items[0].className}>
            <span>{items[0].value}</span>
          </GridItem>
          <GridItem md={2} sm={6}>
            <span className="list-group-item-heading">
              {__(items[1].title)}:
            </span>
          </GridItem>
          <GridItem md={3} sm={6} className={items[1].className}>
            {items[1].value}
          </GridItem>
        </React.Fragment>
      ))}
      <GridItem span={12} className="pf-v5-u-pb-lg" />
      <GridItem span={12}>
        <span className="list-group-item-heading">{__('State')}: </span>
        {state}
      </GridItem>
      <GridItem span={12}>
        <Progress
          value={progress}
          max={100}
          aria-label={`${progress}% ${__('Complete')}`}
          measureLocation="outside"
          {...(progVariant ? { variant: progVariant } : {})}
        />
      </GridItem>
      <GridItem span={12} className="pf-v5-u-pb-lg" />
      {help && (
        <GridItem span={12}>
          <b>{__('Troubleshooting')}</b>
          <p dangerouslySetInnerHTML={{ __html: help }} />
        </GridItem>
      )}
      {output && output.length > 0 && (
        <GridItem span={12}>
          <b>{__('Output:')}</b>
          <pre>{output}</pre>
        </GridItem>
      )}
    </Grid>
  );
};

TaskInfo.propTypes = {
  action: PropTypes.string,
  endedAt: PropTypes.string,
  result: PropTypes.string,
  startAt: PropTypes.string,
  startBefore: PropTypes.string,
  startedAt: PropTypes.string,
  state: PropTypes.string,
  help: PropTypes.string,
  progress: PropTypes.number,
  username: PropTypes.string,
  usernamePath: PropTypes.string,
  output: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
};

TaskInfo.defaultProps = {
  action: '',
  endedAt: '',
  result: 'error',
  startAt: '',
  startBefore: '',
  startedAt: '',
  state: '',
  help: '',
  progress: 0,
  username: '',
  usernamePath: '',
  output: '',
};

export default TaskInfo;
