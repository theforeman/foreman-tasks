/*
Creates a nested object from an array, ans sets the last value to true
*/
export const buildObject = data => {
  const focusedOn = {};
  let temp = focusedOn;
  for (let i = 0; i < data.length - 1; i++) {
    temp[data[i]] = {};
    temp = temp[data[i]];
  }
  temp[data[data.length - 1]] = true;
  return focusedOn;
};
