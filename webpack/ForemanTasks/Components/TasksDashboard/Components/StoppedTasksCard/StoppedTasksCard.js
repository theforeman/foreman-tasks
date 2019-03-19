import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'patternfly-react';
import classNames from 'classnames';
import { translate as __ } from 'foremanReact/common/I18n';
import './StoppedTasksCard.scss';

class StoppedTasksCard extends React.Component {
  getTableItemClassName = (item, type) => {
    const { focusedOn } = this.props;
    return focusedOn.normal ||
      focusedOn.total ||
      (focusedOn[item] && focusedOn[item][type])
      ? `${type}-data`
      : 'not-focused';
  };
  shouleBeSelected = focusedOn =>
    focusedOn &&
    (focusedOn.total ||
      ((focusedOn.warning &&
        (focusedOn.warning.total || focusedOn.warning.last)) ||
        (focusedOn.success &&
          (focusedOn.success.total || focusedOn.success.last))) ||
      (focusedOn.error && (focusedOn.error.total || focusedOn.error.last)));
  render() {
    const {
      className,
      error,
      warning,
      success,
      timePeriod,
      focusedOn,
      onTitleClick,
    } = this.props;
    const data = { error, warning, success };

    return (
      <Card
        className={classNames(
          'tasks-donut-card',
          'stopped-tasks-card',
          className,
          {
            'selected-tasks-card': this.shouleBeSelected(focusedOn),
          }
        )}
      >
        <Card.Title onClick={onTitleClick}>{__('Stopped')}</Card.Title>
        <Card.Body>
          <table className="table table-titles">
            <tbody>
              <tr>
                <td />
                <td>Total</td>
                <td>{timePeriod}</td>
              </tr>
            </tbody>
          </table>
          <table className="table table-bordered table-striped">
            <tbody>
              {Object.keys(data).map((item, index) => (
                <tr className={`${item}-row`} key={index}>
                  <td>{item[0].toUpperCase() + item.slice(1)}</td>
                  <td
                    className={this.getTableItemClassName(item, 'total')}
                    onClick={data[item].total.onClick}
                  >
                    {data[item].total.value}
                  </td>
                  <td
                    className={this.getTableItemClassName(item, 'last')}
                    onClick={data[item].last.onClick}
                  >
                    {data[item].last.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card.Body>
      </Card>
    );
  }
}

StoppedTasksCard.propTypes = {
  className: PropTypes.string,
  focusedOn: PropTypes.shape({
    normal: PropTypes.bool,
    error: PropTypes.shape({
      total: PropTypes.bool,
      last: PropTypes.bool,
    }),
    warning: PropTypes.shape({
      total: PropTypes.bool,
      last: PropTypes.bool,
    }),
    success: PropTypes.shape({
      total: PropTypes.bool,
      last: PropTypes.bool,
    }),
  }),
  onTitleClick: PropTypes.func,
  error: PropTypes.shape({
    total: PropTypes.shape({
      value: PropTypes.number,
      onClick: PropTypes.func,
    }),
    last: PropTypes.shape({ value: PropTypes.number, onClick: PropTypes.func }),
  }),
  warning: PropTypes.shape({
    total: PropTypes.shape({
      value: PropTypes.number,
      onClick: PropTypes.func,
    }),
    last: PropTypes.shape({ value: PropTypes.number, onClick: PropTypes.func }),
  }),
  success: PropTypes.shape({
    total: PropTypes.shape({
      value: PropTypes.number,
      onClick: PropTypes.func,
    }),
    last: PropTypes.shape({ value: PropTypes.number, onClick: PropTypes.func }),
  }),
  timePeriod: PropTypes.string,
};

StoppedTasksCard.defaultProps = {
  className: '',
  focusedOn: {},
  onTitleClick: () => null,
  error: { total: 0, last: 0 },
  warning: { total: 0, last: 0 },
  success: { total: 0, last: 0 },
  timePeriod: '24h',
};

export default StoppedTasksCard;
