// Get Task ID from URL. Split url by '/', filter non-empty values and get Task ID.
export const getTaskID = () =>
  window.location.pathname
    .split('/')
    .filter(i => i)
    .slice(-1)[0];
