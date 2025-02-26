import * as dayjs from 'dayjs';
dayjs().format();

export const formatDate = (date: Date, formatString): string => {
  return dayjs(date).format(formatString);
};

export const flattenObject = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (obj[key] instanceof Date) {
      acc[pre + key] = formatDate(obj[key], 'YYYY-MM-DD hh:mm:ss');
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(acc, flattenObject(obj[key]));
    } else {
      acc[pre + key] = obj[key];
    }
    return acc;
  }, {});
};

export const convertArrayOfObjectsToCSV = (
  array: Record<string, any>[],
  defaultHeaders = [],
) => {
  if (array.length === 0) {
    return '';
  }

  const headers = defaultHeaders.length
    ? defaultHeaders
    : Object.keys(flattenObject(array[0]));

  let csvContent = headers.join(',') + '\n';

  csvContent += array
    .map((row) => {
      const flattenedRow = flattenObject(row);
      return headers
        .map((header) => {
          if (flattenedRow[header]?.toString().includes(',')) {
            return `"${flattenedRow[header]}"`;
          }
          return flattenedRow[header];
        })
        .join(',');
    })
    .join('\n');

  return csvContent;
};
