import URI from 'urijs';

export const updateURlQuery = query => {
  const uri = new URI(window.location.href);
  uri.setSearch(query);
  window.history.pushState({ path: uri.toString() }, '', uri.toString());
};
