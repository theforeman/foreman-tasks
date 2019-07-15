/*
  Copied from react-c3js: https://github.com/bcbcarl/react-c3js/blob/master/src/index.js
  Added missing features:
    * onChartCreate
    * onChartUpdate

  TODO: update react-c3js or move to patternfly-react
 */

/* eslint-disable global-require,
                  import/no-extraneous-dependencies,
                  react/no-find-dom-node,
                  react/no-unused-prop-types,
                  react/require-default-props
*/
import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';

let c3;

class C3Chart extends React.Component {
  componentDidMount() {
    c3 = require('c3');
    this.updateChart(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.updateChart(newProps);
    if (newProps.onPropsChanged) {
      newProps.onPropsChanged(this.props, newProps, this.chart);
    }
  }

  componentWillUnmount() {
    this.destroyChart();
  }

  destroyChart() {
    try {
      // A workaround for a case, where the chart might be still in transition
      // phase while unmounting/destroying - destroying right away leads
      // to issue described in https://github.com/bcbcarl/react-c3js/issues/22.
      // Delaying the destroy a bit seems to resolve the issue.
      // The chart API methods are already bind explicitly, therefore we don't need
      // any special handling when passing the function.
      setTimeout(this.chart.destroy, 1000);
      this.chart = null;
    } catch (err) {
      throw new Error('Internal C3 error', err);
    }
  }

  generateChart(config) {
    const newConfig = Object.assign({ bindto: findDOMNode(this) }, config);
    return c3.generate(newConfig);
  }

  loadNewData(data) {
    this.chart.load(data);
  }

  unloadData() {
    this.chart.unload();
  }

  createChart(config) {
    const { onChartCreate } = this.props;
    this.chart = this.generateChart(config);

    if (onChartCreate) onChartCreate(this.chart, config);
  }

  updateChart(config) {
    const { onChartUpdate } = this.props;

    if (!this.chart) {
      this.createChart(config);
    }

    if (config.unloadBeforeLoad) {
      this.unloadData();
    }

    this.loadNewData(config.data);

    if (onChartUpdate) onChartUpdate(this.chart, config);
  }

  render() {
    const className = this.props.className ? ` ${this.props.className}` : '';
    const style = this.props.style ? this.props.style : {};
    return <div className={className} style={style} />;
  }
}

C3Chart.displayName = 'C3Chart';

C3Chart.propTypes = {
  data: PropTypes.object.isRequired,
  title: PropTypes.object,
  size: PropTypes.object,
  padding: PropTypes.object,
  color: PropTypes.object,
  interaction: PropTypes.object,
  transition: PropTypes.object,
  oninit: PropTypes.func,
  onrendered: PropTypes.func,
  onmouseover: PropTypes.func,
  onmouseout: PropTypes.func,
  onresize: PropTypes.func,
  onresized: PropTypes.func,
  axis: PropTypes.object,
  grid: PropTypes.object,
  regions: PropTypes.array,
  legend: PropTypes.object,
  tooltip: PropTypes.object,
  subchart: PropTypes.object,
  zoom: PropTypes.object,
  point: PropTypes.object,
  line: PropTypes.object,
  area: PropTypes.object,
  bar: PropTypes.object,
  pie: PropTypes.object,
  donut: PropTypes.object,
  gauge: PropTypes.object,
  className: PropTypes.string,
  style: PropTypes.object,
  unloadBeforeLoad: PropTypes.bool,
  onPropsChanged: PropTypes.func,
  onChartCreate: PropTypes.func,
  onChartUpdate: PropTypes.func,
};

export default C3Chart;
