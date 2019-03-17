import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Chart from '../../../../Components/Chart/Chart';

import {
  TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS,
  COLLOR_PATTERN,
} from './TasksDonutChartConstants';
import {
  baseChartConfig,
  shouleBeSelected,
  createChartData,
  updateChartTitle,
} from './TasksDonutChartHelper';
import './TasksDonutChart.scss';

class TasksDonutChart extends React.Component {
  componentDidUpdate() {
    this.updateChartTitle();
    this.updateChartFocus();
  }

  onChartCreate(chart) {
    this.chart = chart;

    this.updateChartTitle();
    this.updateChartFocus();
  }

  updateChartTitle() {
    const { last, older, onTotalClick } = this.props;

    updateChartTitle({
      chartElement: this.chart.element,
      value: last + older,
      onClick: () => onTotalClick(),
      onMouseOver: () => this.setChartFocus({ focusedOn: { total: true } }),
      onMouseOut: () => this.updateChartFocus(),
    });
  }

  updateChartFocus() {
    this.setChartFocus(this.props.focusedOn);
  }

  setChartFocus(focusedOn) {
    if (focusedOn.total) {
      this.chart.focus([
        TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.LAST,
        TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.OLDER,
      ]);
    }
    if (focusedOn.last) {
      this.chart.focus([TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.LAST]);
    }
    if (focusedOn.older) {
      this.chart.focus([TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.OLDER]);
    }
    if (!focusedOn || JSON.stringify(focusedOn) === '{}') {
      this.chart.focus([]);
    }
  }

  render() {
    const {
      className,
      last,
      older,
      timePeriod,
      focusedOn,
      colorsPattern,
      onLastClick,
      onOlderClick,
    } = this.props;

    const { columns, names, onItemClick } = createChartData({
      last,
      older,
      timePeriod,
      onLastClick,
      onOlderClick,
    });

    const classes = classNames(
      'donut-chart-pf',
      'tasks-donut-chart',
      className,
      { 'tasks-donut-selected': shouleBeSelected(focusedOn) }
    );

    return (
      <Chart
        {...baseChartConfig}
        type="donut"
        className={classes}
        color={{ pattern: colorsPattern }}
        onChartCreate={chart => this.onChartCreate(chart)}
        data={{
          columns,
          names,
          onclick: ({ id }) => onItemClick(id),
          onmouseover: ({ id }) => this.setChartFocus(id),
          onmouseout: () => this.updateChartFocus(),
          type: 'donut',
        }}
        legend={{
          show: true,
          position: 'right',
          item: {
            onclick: id => onItemClick(id),
            onmouseover: id => this.setChartFocus(id),
            onmouseout: () => this.updateChartFocus(),
          },
        }}
      />
    );
  }
}

TasksDonutChart.propTypes = {
  last: PropTypes.number.isRequired,
  older: PropTypes.number.isRequired,
  className: PropTypes.string,
  timePeriod: PropTypes.string,
  colorsPattern: PropTypes.arrayOf(PropTypes.string),
  focusedOn: PropTypes.shape({}),
  onTotalClick: PropTypes.func,
  onLastClick: PropTypes.func,
  onOlderClick: PropTypes.func,
};

TasksDonutChart.defaultProps = {
  className: '',
  timePeriod: '24h',
  colorsPattern: COLLOR_PATTERN,
  focusedOn: {},
  onTotalClick: () => null,
  onLastClick: () => null,
  onOlderClick: () => null,
};

export default TasksDonutChart;
