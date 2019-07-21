import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ForemanTasksRouter from './Routes/ForemanTasksRouter';

const ForemanTasks = () => (
  <BrowserRouter>
    <div>
      <ForemanTasksRouter />
    </div>
  </BrowserRouter>
);

export default ForemanTasks;
