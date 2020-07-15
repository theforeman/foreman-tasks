import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, ProgressBar } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';
import RelativeDateTime from 'foremanReact/components/common/dates/RelativeDateTime';
import ReactHtmlParser from 'react-html-parser';

class TaskInfo extends Component {
  isDelayed = () => {
    const startAt = new Date(this.props.startAt);
    const startedAt = new Date(this.props.startedAt);
    startAt.setMilliseconds(0);
    startedAt.setMilliseconds(0);
    return startAt.getTime() !== startedAt.getTime();
  };
  resultIcon = () => {
    if (this.props.state !== 'stopped') return 'task-status pficon-help';
    const { result } = this.props;
    let icon;
    switch (result) {
      case 'success':
        icon = 'pficon-ok';
        break;
      case 'error':
        icon = 'pficon-error-circle-o';
        break;
      case 'warning':
        icon = 'pficon-ok status-warn';
        break;
      default:
        icon = 'pficon-help';
        break;
    }
    return `task-status ${icon}`;
  };

  progressBarType = () => {
    const { result } = this.props;
    switch (result) {
      case 'error':
        return 'danger';
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      default:
        return null;
    }
  };

  render() {
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
    } = this.props;

    const details = [
      [
        {
          title: 'Name',
          value: action || __('N/A'),
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
              <i className={this.resultIcon()} />
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
          value: __(this.isDelayed() ? 'Delayed' : 'Immediate'),
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
    return (
      <Grid>
        <br />
        {details.map((items, key) => (
          <Row key={key}>
            <Col md={2} sm={6}>
              <span className="list-group-item-heading">
                {__(items[0].title)}:
              </span>
            </Col>
            <Col md={5} sm={6}>
              <span>{items[0].value}</span>
            </Col>
            <Col md={2} sm={6}>
              <span className="list-group-item-heading">
                {__(items[1].title)}:
              </span>
            </Col>
            <Col md={3} sm={6}>
              {items[1].value}
            </Col>
          </Row>
        ))}
        <br />
        <Row>
          <Col xs={6}>
            <div className="progress-description">
              <span className="list-group-item-heading">{__('State')}: </span>
              {state}
            </div>
          </Col>
          <Col xs={3} xsOffset={3} className="progress-label-top-right">
            <span>{`${progress}% ${__('Complete')}`}</span>
          </Col>
          <Col xs={12}>
            <ProgressBar
              now={progress}
              bsStyle={this.progressBarType()}
              striped
            />
          </Col>
        </Row>
        <br />
        {help && (
          <Row>
            <Col xs={12}>
              <p>
                <span>
                  <b>{__('Troubleshooting')}</b>
                </span>
              </p>
              <p>{ReactHtmlParser(help)}</p>
            </Col>
          </Row>
        )}
        {output && output.length > 0 && (
          <Row>
            <Col xs={12}>
              <p>
                <span>
                  <b>{__('Output:')}</b>
                </span>
              </p>
              <pre>{output}</pre>
            </Col>
          </Row>
        )}
        {errors && errors.length > 0 && (
          <Row>
            <Col xs={12}>
              <div>
                <span>
                  <b>{__('Errors:')}</b>
                </span>
              </div>
              <pre>{errors}</pre>
            </Col>
          </Row>
        )}
      </Grid>
    );
  }
}

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
  output: PropTypes.PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({}),
  ]),
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
