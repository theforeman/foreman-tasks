import URI from 'urijs';

export const addSearchToURL = (path, query) => {
  const url = new URI(path);
  url.addSearch({ ...query, include_permissions: true });
  return url.toString();
};
