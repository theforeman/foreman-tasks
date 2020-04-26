import URI from 'urijs';
import { translate as __, documentLocale } from 'foremanReact/common/I18n';
import humanizeDuration from 'humanize-duration';
import { isoCompatibleDate } from 'foremanReact/common/helpers';

export const updateURlQuery = (query, history) => {
  const uri = new URI(history.location.pathname + history.location.search);
  uri.setSearch(query);
  history.push(uri.search());
};

export const getApiPathname = url => {
  const uri = new URI(url);
  return uri.pathname().replace('foreman_tasks/', 'foreman_tasks/api/');
};

export const resolveSearchQuery = (search, history) => {
  const uriQuery = {
    search,
    page: 1,
  };
  updateURlQuery(uriQuery, history);
};

export const getCSVurl = (path, query) => {
  let url = new URI(path);
  url = url.pathname(`${url.pathname()}.csv`);
  url.addSearch(query);
  return url.toString();
};

export const getDuration = (start, finish) => {
  if (!start && !finish)
    return { text: __('N/A'), tooltip: __('No start or end dates') };

  if (!start && finish) {
    return { text: __('N/A'), tooltip: __('Task was canceled') };
  }

  const dateOptions = {
    largest: 1,
    language: documentLocale(),
    fallbacks: ['en'],
    round: true,
  };

  const startDate = new Date(isoCompatibleDate(start));

  if (!finish) {
    const finishDate = new Date();
    const duration = finishDate - startDate;
    return {
      text: `${__('More than')} ${humanizeDuration(duration, dateOptions)}`,
    };
  }

  const finishDate = new Date(isoCompatibleDate(finish));
  const duration = finishDate - startDate;
  return {
    text:
      duration > 0 && duration < 1000
        ? __('Less than a second')
        : humanizeDuration(duration, dateOptions),
  };
};
