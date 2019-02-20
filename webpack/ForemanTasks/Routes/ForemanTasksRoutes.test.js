import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import ForemanTasksRoutes from './ForemanTasksRoutes';

describe('ForemanTasksRoutes', () => {
  it('should create routes', () => {
    Object.entries(ForemanTasksRoutes).forEach(([key, Route]) => {
      const component = shallow(<Route.render some="props" />);
      Route.renderResult = toJson(component);
    });

    expect(ForemanTasksRoutes).toMatchSnapshot();
  });
});
