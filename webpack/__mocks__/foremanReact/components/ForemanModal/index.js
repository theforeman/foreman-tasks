import React from 'react';
import PropTypes from 'prop-types';

const ForemanModal = ({ children }) => <div className="modal">{children}</div>;
ForemanModal.Header = ({ children }) => (
  <div className="modal-header">{children}</div>
);
ForemanModal.Footer = ({ children }) => (
  <div className="modal-footer">{children}</div>
);

ForemanModal.propTypes = {
  children: PropTypes.node.isRequired,
};
ForemanModal.Header.propTypes = ForemanModal.propTypes;
ForemanModal.Footer.propTypes = ForemanModal.propTypes;

export default ForemanModal;
