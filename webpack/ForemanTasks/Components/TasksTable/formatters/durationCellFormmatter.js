import React from 'react';

export const durationCellFormmatter = value => (
  <span className="param-value" title={value.tooltip}>
    {value.text}
  </span>
);
