import { translate as __, sprintf } from 'foremanReact/common/I18n';
import { TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS } from './TasksDonutChartConstants';

const { patternfly } = window;

const {
  LAST,
  OLDER,
  TOTAL,
  NONE,
  NORMAL,
} = TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS;

export const baseChartConfig = patternfly
  .c3ChartDefaults()
  .getDefaultDonutConfig();

export const shouleBeSelected = focusedOn =>
  focusedOn !== NORMAL && focusedOn !== NONE;

export const getFocusedOn = (query, wantedState, wantedTime) => {
  if (query.state === wantedState) {
    if (query.time === wantedTime) {
      switch (query.mode) {
        case 'last':
          return LAST;
        case 'older':
          return OLDER;
        default:
          return TOTAL;
      }
    }

    return TOTAL;
  }

  return query.state ? NONE : NORMAL;
};

export const createChartData = ({
  last,
  older,
  time,
  onLastClick,
  onOlderClick,
}) => {
  const lastKey = LAST;
  const olderKey = OLDER;

  const data = {
    [lastKey]: {
      name: sprintf(__('%(last)s Last %(time)s'), { last, time }),
      value: last,
      onClick: onLastClick,
    },
    [olderKey]: {
      name: sprintf(__('%(older)s Older %(time)s'), {
        older,
        time,
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

export const updateChartTitle = ({ chartElement, value }) =>
  patternfly.pfSetDonutChartTitle(chartElement, value, __('Total'));

export const assignExtraChartEvents = ({
  chartElement,
  onClick,
  onMouseOver,
  onMouseOut,
}) =>
  window.d3
    .select(chartElement)
    .select('text.c3-chart-arcs-title')
    .on('click', onClick)
    .on('mouseover', onMouseOver)
    .on('mouseout', onMouseOut);

export const clearExtraChartEvents = chartElement =>
  window.d3
    .select(chartElement)
    .select('text.c3-chart-arcs-title')
    .on('click', null)
    .on('mouseover', null)
    .on('mouseout', null);
