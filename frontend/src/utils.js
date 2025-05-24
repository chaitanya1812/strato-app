export const formatDate = (dateStr) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', options); // Oct 1 2020
};


export const greaterThanNumber = (row, columnId, filterValue) => {
  return Number(row.getValue(columnId)) > Number(filterValue);
};