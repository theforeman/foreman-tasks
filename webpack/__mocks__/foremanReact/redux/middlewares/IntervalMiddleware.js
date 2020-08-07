export const stopInterval = () => ({
  type: 'stop',
});

export const withInterval = (object, interval) => ({ ...object, interval });
