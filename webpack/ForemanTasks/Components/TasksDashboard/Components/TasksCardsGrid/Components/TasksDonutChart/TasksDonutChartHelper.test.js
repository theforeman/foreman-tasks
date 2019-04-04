import { TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS } from './TasksDonutChartConstants';
import {
  getBaseChartConfig,
  shouleBeSelected,
  getFocusedOn,
  createChartData,
  updateChartTitle,
  assignExtraChartEvents,
  clearExtraChartEvents,
} from './TasksDonutChartHelper';

const {
  LAST,
  OLDER,
  TOTAL,
  NONE,
  NORMAL,
} = TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS;

const defaultChartConfig = {
  baseConfig1: 'base-config-1',
  baseConfig2: 'base-config-2',
};
const c3ChartDefaults = () => ({
  getDefaultDonutConfig: () => defaultChartConfig,
});
let pfSetDonutChartTitle;
let d3Select;
let d3On;

describe('TasksDonutChartHelper', () => {
  beforeEach(() => {
    pfSetDonutChartTitle = jest.fn();
    d3Select = jest.fn(() => global.window.d3);
    d3On = jest.fn(() => global.window.d3);

    global.window.patternfly = {
      c3ChartDefaults,
      pfSetDonutChartTitle,
    };
    global.window.d3 = {
      select: d3Select,
      on: d3On,
    };
  });

  it('should contain the base chart config', () => {
    expect(getBaseChartConfig()).toEqual(defaultChartConfig);
  });

  it('should decide if should-be-selected based on focused-on', () => {
    const selectedFocusedOn = [LAST, OLDER, TOTAL];
    const noneSelectedFocusedOn = [NONE, NORMAL];

    selectedFocusedOn.forEach(opt => expect(shouleBeSelected(opt)).toBe(true));
    noneSelectedFocusedOn.forEach(opt =>
      expect(shouleBeSelected(opt)).toBe(false)
    );
  });

  it('should get focused-on', () => {
    const optionsMap = {
      [NORMAL]: {
        query: {},
        wantedState: '',
        wantedTime: '',
      },
      [NONE]: {
        query: { state: 'some-state' },
        wantedState: '',
        wantedTime: '',
      },
      [LAST]: {
        query: { state: 'wanted-state', time: 'wanted-time', mode: LAST },
        wantedState: 'wanted-state',
        wantedTime: 'wanted-time',
      },
      [OLDER]: {
        query: { state: 'wanted-state', time: 'wanted-time', mode: OLDER },
        wantedState: 'wanted-state',
        wantedTime: 'wanted-time',
      },
      [TOTAL]: {
        query: { state: 'wanted-state' },
        wantedState: 'wanted-state',
        wantedTime: 'wanted-time',
      },
    };

    Object.entries(optionsMap).forEach(([focus, options]) => {
      const focusedOn = getFocusedOn(
        options.query,
        options.wantedState,
        options.wantedTime
      );

      expect(focusedOn).toBe(focus);
    });
  });

  it('should create chart-data', () => {
    expect(
      createChartData({
        last: 1,
        older: 3,
        time: '24h',
        onLastClick: jest.fn(),
        onOlderClick: jest.fn(),
      })
    ).toMatchSnapshot();
  });

  it('should update chart-title', () => {
    const chartElement = 'some-element';
    const value = 'some-value';
    updateChartTitle({ chartElement, value });

    expect(pfSetDonutChartTitle).toBeCalledWith(chartElement, value, 'Total');
  });

  it('should assign extra chart-events', () => {
    const chartElement = 'some-element';
    const onClick = jest.fn();
    const onMouseOver = jest.fn();
    const onMouseOut = jest.fn();

    assignExtraChartEvents({
      chartElement,
      onClick,
      onMouseOver,
      onMouseOut,
    });

    expect(d3Select).toHaveBeenNthCalledWith(1, chartElement);
    expect(d3Select).toHaveBeenNthCalledWith(2, 'text.c3-chart-arcs-title');
    expect(d3On).toHaveBeenNthCalledWith(1, 'click', onClick);
    expect(d3On).toHaveBeenNthCalledWith(2, 'mouseover', onMouseOver);
    expect(d3On).toHaveBeenNthCalledWith(3, 'mouseout', onMouseOut);
  });

  it('should clear extra chart-events', () => {
    const chartElement = 'some-element';

    clearExtraChartEvents(chartElement);

    expect(d3Select).toHaveBeenNthCalledWith(1, chartElement);
    expect(d3Select).toHaveBeenNthCalledWith(2, 'text.c3-chart-arcs-title');
    expect(d3On).toHaveBeenNthCalledWith(1, 'click', null);
    expect(d3On).toHaveBeenNthCalledWith(2, 'mouseover', null);
    expect(d3On).toHaveBeenNthCalledWith(3, 'mouseout', null);
  });
});
