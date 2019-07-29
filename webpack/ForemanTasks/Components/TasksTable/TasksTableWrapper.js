import React from 'react';
import { getURIQuery } from 'foremanReact/common/helpers';
import { ExportButton } from './Components/ExportButton';
import TasksTable from './TasksTable';
import { addSearchToURL } from './TasksTableHelpers';

const TasksTableWrapper = ({ ...props }) => (
  <div className="tasks-table-wrapper">
    <ExportButton
      url={addSearchToURL(
        '/foreman_tasks/tasks.csv',
        getURIQuery(window.location.href)
      )}
    />
    <TasksTable {...props} />
  </div>
);

export default TasksTableWrapper;
