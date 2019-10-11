import URI from 'urijs';
import { getURIQuery } from 'foremanReact/common/helpers';

export const updateURlQuery = query => {
  const uri = new URI(window.location.href);
  uri.setSearch(query);
  window.history.pushState({ path: uri.toString() }, '', uri.toString());
};

export const getApiPathname = () => {
  const uri = new URI(window.location.href);
  return uri.pathname().replace('foreman_tasks/', 'foreman_tasks/api/');
};

export const getURIPagination = () => {
  const { per_page: perPage, page } = getURIQuery(window.location.href);
  return { perPage: Number(perPage) || 20, page: Number(page) || 1 };
};
