import { translate as __, documentLocale } from 'foremanReact/common/I18n';
import React from 'react';
import { FormattedRelative } from 'react-intl';
import humanizeDuration from 'humanize-duration';

const formatDate = date => {
  // Firefox doesnt format dd-mm-yyyy type strings to date
  if (typeof date === 'string' || date instanceof String)
    return new Date(date.replace(/-/, '/').replace(/-/, '/'));
  return date;
};

export const timeInWords = time => {
  if (!time) return __('N/A');
  time = formatDate(time);
  return <FormattedRelative value={time} />;
};

export const durationInWords = (
  start,
  finish,
  selectedLocale = documentLocale()
) => {
  if (!start) return __('N/A');
  start = formatDate(start).getTime();
  finish = formatDate(finish).getTime();
  return {
    text: humanizeDuration(new Date(finish - start).getTime(), {
      largest: 1,
      language: selectedLocale,
      fallbacks: ['en'],
    }),
    tooltip: `${numberWithDelimiter((finish - start) / 1000)} ${__('seconds')}`,
  };
};

const numberWithDelimiter = x =>
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
