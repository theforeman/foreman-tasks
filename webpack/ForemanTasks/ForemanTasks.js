import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ForemanTasksRouter from './Routes/ForemanTasksRouter';

const ForemanTasks = () => (
  <BrowserRouter>
    <ForemanTasksRouter />
  </BrowserRouter>
);

export default ForemanTasks;
