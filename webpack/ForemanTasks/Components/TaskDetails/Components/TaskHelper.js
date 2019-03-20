import { translate as __ } from 'foremanReact/common/I18n';
import React from 'react';
import { FormattedRelative } from 'react-intl';

const timeSince = date => {
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return `${interval} years`;
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval} months`;
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval} days`;
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval} hours`;
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval} minutes`;
  }
  return `${Math.floor(seconds)} seconds`;
};

const formatDate = date => {
  // Firefox doesnt format dd-mm-yyyy type strings to date
  if (typeof date === 'string' || date instanceof String)
    return new Date(date.replace(/-/g, '/'));
  return date;
};

export const timeInWords = time => {
  if (!time) return __('N/A');
  time = formatDate(time);
  return <FormattedRelative value={time} />;
};

const distanceOfTimeInWords = (start, finish) => {
  const time = new Date(finish - start).getTime();
  return timeSince(new Date().getTime() - time);
};

const numberWithDelimiter = x =>
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const durationInWords = (start, finish) => {
  if (!start) return __('N/A');
  start = formatDate(start).getTime();
  finish = formatDate(finish).getTime();
  return {
    text: distanceOfTimeInWords(start, finish),
    tooltip: `${numberWithDelimiter((finish - start) / 1000)} ${__('seconds')}`,
  };
};
