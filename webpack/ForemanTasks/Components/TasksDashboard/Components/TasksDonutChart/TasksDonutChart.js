import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Chart from '../../../../Components/Chart/Chart';

import {
  TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS,
  TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS_ARRAY,
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
      onMouseOver: () =>
        this.setChartFocus(TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.TOTAL),
      onMouseOut: () => this.updateChartFocus(),
    });
  }

  updateChartFocus() {
    this.setChartFocus(this.props.focusedOn);
  }

  setChartFocus(focusedOn) {
    switch (focusedOn) {
      case TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.TOTAL:
        this.chart.focus([
          TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.LAST,
          TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.OLDER,
        ]);
        break;
      case TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.LAST:
      case TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.OLDER:
        this.chart.focus(focusedOn);
        break;
      case TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.NONE:
        this.chart.focus([]);
        break;
      default:
        this.chart.revert();
    }
  }

  render() {
    const {
      className,
      last,
      older,
      time,
      focusedOn,
      colorsPattern,
      onLastClick,
      onOlderClick,
    } = this.props;

    const { columns, names, onItemClick } = createChartData({
      last,
      older,
      time,
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
        size={{ height: 120 }}
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
  time: PropTypes.string,
  colorsPattern: PropTypes.arrayOf(PropTypes.string),
  focusedOn: PropTypes.oneOf(TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS_ARRAY),
  onTotalClick: PropTypes.func,
  onLastClick: PropTypes.func,
  onOlderClick: PropTypes.func,
};

TasksDonutChart.defaultProps = {
  className: '',
  time: '24h',
  colorsPattern: COLLOR_PATTERN,
  focusedOn: TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.NORMAL,
  onTotalClick: () => null,
  onLastClick: () => null,
  onOlderClick: () => null,
};

export default TasksDonutChart;
