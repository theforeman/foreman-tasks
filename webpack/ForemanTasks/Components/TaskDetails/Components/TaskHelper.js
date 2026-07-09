import { translate as __, documentLocale } from 'foremanReact/common/I18n';
import { isoCompatibleDate } from 'foremanReact/common/helpers';
import humanizeDuration from 'humanize-duration';

export const durationInWords = (
  start,
  finish,
  selectedLocale = documentLocale()
) => {
  if (!start) return __('N/A');
  start = new Date(isoCompatibleDate(start)).getTime();
  finish = new Date(isoCompatibleDate(finish)).getTime();
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

export const isDelayed = ({ startAt, startedAt }) => {
  if (
    startAt == null ||
    startedAt == null ||
    startAt === '' ||
    startedAt === ''
  ) {
    return false;
  }

  const a = new Date(startAt);
  const b = new Date(startedAt);

  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
    return false;
  }

  a.setMilliseconds(0);
  b.setMilliseconds(0);

  return a.getTime() !== b.getTime();
};

export const parseUsernameLinkHref = usernamePath => {
  if (!usernamePath || typeof usernamePath !== 'string') {
    return null;
  }

  const match = usernamePath.match(/href=(["'])(.*?)\1/i);

  return match ? match[2] : null;
};

export const formatTaskDuration = (startedAtStr, endedAtStr, state) => {
  if (state !== 'stopped' || !startedAtStr || !endedAtStr) {
    return __('N/A');
  }

  const startMs = new Date(startedAtStr).getTime();
  const endMs = new Date(endedAtStr).getTime();

  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) {
    return __('N/A');
  }

  const duration = durationInWords(startedAtStr, endedAtStr);

  if (typeof duration === 'string') {
    return duration;
  }

  return duration.text;
};
