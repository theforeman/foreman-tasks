export const selectAPIResponse = (state, key) => ({
  data: {
    text: 'some-data',
    key,
  },
});

export const selectAPIStatus = (state, key) => 'PENDING';
export const selectAPIError = (state, key) => ({ error: `${key} ERRROR` });
