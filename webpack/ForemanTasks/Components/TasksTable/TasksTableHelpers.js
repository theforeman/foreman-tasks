import URI from 'urijs';

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

export const addSearchToURL = (path, query) => {
  const url = new URI(path);
  url.addSearch({ ...query, include_permissions: true });
  return url.toString();
};
