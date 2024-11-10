const parseNumber = (value, defaultValue) => {
  const parsedNumber = Number(value);
  if (Number.isNaN(parsedNumber)) {
    return defaultValue;
  }
  return parsedNumber;
};

export function parsePaginationParams(query) {
  const { page, perPage } = query;

  const parsedPage = parseNumber(page, 1);
  const parsedPerPage = parseNumber(perPage, 10);

  return {
    page: parsedPage > 0 ? parsedPage : 1,
    perPage: parsedPerPage > 0 ? parsedPerPage : 10,
  };
}
