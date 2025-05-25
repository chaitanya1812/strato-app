export const greaterThanNumber = (row, columnId, filterValue) => {
  return Number(row.getValue(columnId)) > Number(filterValue);
};