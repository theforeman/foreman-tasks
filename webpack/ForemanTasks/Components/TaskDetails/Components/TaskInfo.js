import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  GridItem,
  Progress,
  ProgressVariant,
  Icon,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  QuestionCircleIcon,
} from '@patternfly/react-icons';
import { translate as __ } from 'foremanReact/common/I18n';
import RelativeDateTime from 'foremanReact/components/common/dates/RelativeDateTime';

const isDelayed = ({ startAt, startedAt }) => {
  const a = new Date(startAt);
  const b = new Date(startedAt);
  a.setMilliseconds(0);
  b.setMilliseconds(0);
  return a.getTime() !== b.getTime();
};

const resultIconEl = (state, result) => {
  if (state !== 'stopped')
    return (
      <Icon>
        <QuestionCircleIcon />
      </Icon>
    );
  switch (result) {
    case 'success':
      return (
        <Icon status="success">
          <CheckCircleIcon />
        </Icon>
      );
    case 'error':
      return (
        <Icon status="danger">
          <ExclamationCircleIcon />
        </Icon>
      );
    case 'warning':
      return (
        <Icon status="warning">
          <ExclamationTriangleIcon />
        </Icon>
      );
    default:
      return (
        <Icon>
          <QuestionCircleIcon />
        </Icon>
      );
  }
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
    errors,
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
          <React.Fragment>
            {resultIconEl(state, result)}
            <span> {result}</span>
          </React.Fragment>
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
    <Grid hasGutter>
      <GridItem span={12}>
        <br />
      </GridItem>
      {details.map((items, key) => (
        <Grid hasGutter key={key}>
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
        </Grid>
      ))}
      <GridItem span={12}>
        <br />
      </GridItem>
      <Grid hasGutter>
        <GridItem span={6}>
          <div className="progress-description">
            <span className="list-group-item-heading">{__('State')}: </span>
            {state}
          </div>
        </GridItem>
        <GridItem span={6} className="progress-label-top-right">
          <span>{`${progress}% ${__('Complete')}`}</span>
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
      </Grid>
      <GridItem span={12}>
        <br />
      </GridItem>
      {help && (
        <Grid hasGutter>
          <GridItem span={12}>
            <p>
              <span>
                <b>{__('Troubleshooting')}</b>
              </span>
            </p>
            <p dangerouslySetInnerHTML={{ __html: help }} />
          </GridItem>
        </Grid>
      )}
      {output && output.length > 0 && (
        <Grid hasGutter>
          <GridItem span={12}>
            <p>
              <span>
                <b>{__('Output:')}</b>
              </span>
            </p>
            <pre>{output}</pre>
          </GridItem>
        </Grid>
      )}
      {errors && errors.length > 0 && (
        <Grid hasGutter>
          <GridItem span={12}>
            <div>
              <span>
                <b>{__('Errors:')}</b>
              </span>
            </div>
            <pre>{errors}</pre>
          </GridItem>
        </Grid>
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
  errors: PropTypes.array,
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
  errors: [],
  progress: 0,
  username: '',
  usernamePath: '',
  output: '',
};

export default TaskInfo;
