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
