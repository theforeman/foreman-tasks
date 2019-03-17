import React from 'react';
import PropTypes from 'prop-types';

const TasksDashboard = ({ children, className }) => (
  <div className={className}>{children}</div>
);

TasksDashboard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

TasksDashboard.defaultProps = {
  className: '',
  children: null,
};

export default TasksDashboard;
