import React from 'react';
import LongDateTime from 'foremanReact/components/common/dates/LongDateTime';
import { translate as __ } from 'foremanReact/common/I18n';

export const dateCellFormmatter = value => (
  <LongDateTime seconds date={value} defaultValue={__('N/A')} />
);
