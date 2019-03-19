export const getTableItemClassName = (item, type, focusedOn) =>
  focusedOn.normal ||
  focusedOn.total ||
  (focusedOn[item] && focusedOn[item][type])
    ? `${type}-col`
    : `${type}-col not-focused`;

export const shouleBeSelected = focusedOn =>
  focusedOn &&
  ['error', 'warning', 'success']
    .map(focuseRowKey => focusedOn[focuseRowKey] || {})
    .map(focusRow => focusRow.total || focusRow.last)
    .includes(true);
