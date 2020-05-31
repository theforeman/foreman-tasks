import React from 'react';
import { shallow } from '@theforeman/test';

import ForemanTasksRoutes from './ForemanTasksRoutes';

describe('ForemanTasksRoutes', () => {
  it('should create routes', () => {
    Object.entries(ForemanTasksRoutes).forEach(([key, Route]) => {
      const RouteRender = Route.render;
      const component = shallow(<RouteRender history={{}} some="props" />);
      Route.renderResult = component;
    });

    expect(ForemanTasksRoutes).toMatchSnapshot();
  });
});
