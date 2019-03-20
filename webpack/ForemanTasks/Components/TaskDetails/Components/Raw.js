import React from 'react';
import PropTypes from 'prop-types';
import { translate as __ } from 'foremanReact/common/I18n';

import { durationInWords } from './TaskHelper';

const Raw = ({ id, label, startedAt, endedAt, input, output, externalId }) => (
  <div>
    <div>
      <span className="param-name list-group-item-heading">{__('Id')}:</span>
      <span className="param-value">{id}</span>
    </div>
    <div>
      <span className="param-name list-group-item-heading">{__('Label')}:</span>
      <span className="param-value">{label}</span>
    </div>
    <div>
      <span className="param-name list-group-item-heading">
        {__('Duration')}:
      </span>
      <span
        className="param-value"
        title={durationInWords(startedAt, endedAt || new Date()).tooltip}
      >
        {durationInWords(startedAt, endedAt || new Date()).text}
      </span>
    </div>
    <div>
      <span className="param-name list-group-item-heading">
        {__('Raw input')}:
      </span>
      <span className="param-value">
        <pre>{JSON.stringify(input, null, '  ')}</pre>
      </span>
    </div>
    <div>
      <span className="param-name list-group-item-heading">
        {__('Raw output')}:
      </span>
      <span className="param-value">
        <pre>{JSON.stringify(output, null, '  ')}</pre>
      </span>
    </div>
    <div>
      <span className="param-name list-group-item-heading">
        {__('External Id')}:
      </span>
      <span className="param-value">{externalId}</span>
    </div>
  </div>
);

Raw.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  startedAt: PropTypes.string,
  endedAt: PropTypes.string,
  input: PropTypes.oneOfType([PropTypes.array, PropTypes.shape({})]),
  output: PropTypes.shape({}),
  externalId: PropTypes.string,
};

Raw.defaultProps = {
  id: '',
  label: '',
  startedAt: '',
  endedAt: '',
  input: [],
  output: {},
  externalId: '',
};

export default Raw;
