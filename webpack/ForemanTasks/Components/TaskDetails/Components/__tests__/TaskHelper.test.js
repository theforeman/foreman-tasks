import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { IntlProvider } from 'react-intl';
import { timeInWords, durationInWords } from '../TaskHelper';

describe('timeInWords', () => {
  it('should work for past minutes', () => {
    const component = mount(
      <IntlProvider locale="en">
        {timeInWords(new Date().getTime() - 1000 * 60 * 5)}
      </IntlProvider>
    );
    expect(toJson(component.render())).toMatchSnapshot();
  });
  it('should work for past hours', () => {
    const component = mount(
      <IntlProvider locale="en">
        {timeInWords(new Date().getTime() - 1000 * 60 * 60 * 5)}
      </IntlProvider>
    );
    expect(toJson(component.render())).toMatchSnapshot();
  });
  it('should work for past days', () => {
    const component = mount(
      <IntlProvider locale="en">
        {timeInWords(new Date().getTime() - 1000 * 60 * 60 * 24 * 5)}
      </IntlProvider>
    );
    expect(toJson(component.render())).toMatchSnapshot();
  });
  it('should work for future minutes', () => {
    const component = mount(
      <IntlProvider locale="en">
        {timeInWords(new Date().getTime() + 1000 * 60 * 5)}
      </IntlProvider>
    );
    expect(toJson(component.render())).toMatchSnapshot();
  });
  it('should work for future hours', () => {
    const component = mount(
      <IntlProvider locale="en">
        {timeInWords(new Date().getTime() + 1000 * 60 * 60 * 5)}
      </IntlProvider>
    );
    expect(toJson(component.render())).toMatchSnapshot();
  });
  it('should work for future days', () => {
    const component = mount(
      <IntlProvider locale="en">
        {timeInWords(new Date().getTime() + 1000 * 60 * 60 * 24 * 5)}
      </IntlProvider>
    );
    expect(toJson(component.render())).toMatchSnapshot();
  });
});

describe('durationInWords', () => {
  it('should work for seconds', () => {
    expect(durationInWords('1/1/1 10:00:00', '1/1/1 10:00:01')).toEqual({
      text: '1 second',
      tooltip: '1 seconds',
    });
  });
  it('should work for minutes', () => {
    expect(durationInWords('1/1/1 10:00:00', '1/1/1 10:02:01')).toEqual({
      text: '2 minutes',
      tooltip: '121 seconds',
    });
  });
  it('should work for hours', () => {
    expect(durationInWords('1/1/1 10:00:00', '1/1/1 13:00:01')).toEqual({
      text: '3 hours',
      tooltip: '10,801 seconds',
    });
  });
});
