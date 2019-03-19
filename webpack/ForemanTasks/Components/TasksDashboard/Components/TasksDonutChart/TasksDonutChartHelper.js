import { translate as __, sprintf } from 'foremanReact/common/I18n';
import { TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS } from './TasksDonutChartConstants';

const { patternfly } = window;

export const baseChartConfig = patternfly
  .c3ChartDefaults()
  .getDefaultDonutConfig();

export const shouleBeSelected = focusedOn =>
  focusedOn !== TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.NORMAL &&
  focusedOn !== TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.NONE;

export const createChartData = ({
  last,
  older,
  timePeriod,
  onLastClick,
  onOlderClick,
}) => {
  const lastKey = TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.LAST;
  const olderKey = TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.OLDER;

  const data = {
    [lastKey]: {
      name: sprintf(__('%(last)s Last %(timePeriod)s'), { last, timePeriod }),
      value: last,
      onClick: onLastClick,
    },
    [olderKey]: {
      name: sprintf(__('%(older)s Older %(timePeriod)s'), {
        older,
        timePeriod,
      }),
      value: older,
      onClick: onOlderClick,
    },
  };

  const columns = Object.entries(data).map(([key, item]) => [key, item.value]);
  const names = {
    [lastKey]: data[lastKey].name,
    [olderKey]: data[olderKey].name,
  };
  const onItemClick = key => data[key].onClick();

  return { columns, names, onItemClick };
};

export const updateChartTitle = ({
  chartElement,
  value,
  onClick,
  onMouseOver,
  onMouseOut,
}) => {
  patternfly.pfSetDonutChartTitle(chartElement, value, __('Total'));

  window.d3
    .select(chartElement)
    .select('text.c3-chart-arcs-title')
    .on('click', onClick)
    .on('mouseover', onMouseOver)
    .on('mouseout', onMouseOut);
};
