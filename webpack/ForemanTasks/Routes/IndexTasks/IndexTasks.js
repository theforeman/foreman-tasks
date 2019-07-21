import React from 'react';
import PropTypes from 'prop-types';
import TasksTablePage from '../../Components/TasksTable';

const IndexTasks = ({ history }) => (
  <div>
    <TasksTablePage history={history} />
  </div>
);
IndexTasks.propTypes = {
  history: PropTypes.object.isRequired,
};

export default IndexTasks;
