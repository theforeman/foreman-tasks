import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'patternfly-react';
import classNames from 'classnames';
import { capitalize } from 'lodash';
import { translate as __ } from 'foremanReact/common/I18n';
import './StoppedTasksCard.scss';
import {
  getTableItemClassName,
  shouleBeSelected,
} from './StoppedTasksCardHelpers';

const StoppedTasksCard = ({
  className,
  error,
  warning,
  success,
  timePeriod,
  focusedOn,
  onTitleClick,
}) => {
  const data = { error, warning, success };

  return (
    <Card
      className={classNames(
        'tasks-donut-card',
        'stopped-tasks-card',
        className,
        {
          'selected-tasks-card': shouleBeSelected(focusedOn),
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
        <table className="table table-bordered table-striped stopped-table">
          <tbody>
            {Object.entries(data).map(([key, value], index) => (
              <tr className={`${key}-row`} key={index}>
                <td>{capitalize(key)}</td>
                <td
                  className={getTableItemClassName(key, 'total', focusedOn)}
                  onClick={value.total.onClick}
                >
                  {value.total.value}
                </td>
                <td
                  className={getTableItemClassName(key, 'last', focusedOn)}
                  onClick={value.last.onClick}
                >
                  {value.last.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card.Body>
    </Card>
  );
};

const focusedOnResultPropType = PropTypes.shape({
  total: PropTypes.bool,
  last: PropTypes.bool,
});

const resultPropType = PropTypes.shape({
  total: PropTypes.shape({
    value: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
  last: PropTypes.shape({ value: PropTypes.number, onClick: PropTypes.func }),
});

StoppedTasksCard.propTypes = {
  onTitleClick: PropTypes.func.isRequired,
  error: resultPropType.isRequired,
  warning: resultPropType.isRequired,
  success: resultPropType.isRequired,
  timePeriod: PropTypes.string,
  className: PropTypes.string,
  focusedOn: PropTypes.shape({
    normal: PropTypes.bool,
    total: PropTypes.bool,
    error: focusedOnResultPropType,
    warning: focusedOnResultPropType,
    success: focusedOnResultPropType,
  }),
};

StoppedTasksCard.defaultProps = {
  className: '',
  focusedOn: {},
  timePeriod: '24h',
};

export default StoppedTasksCard;
