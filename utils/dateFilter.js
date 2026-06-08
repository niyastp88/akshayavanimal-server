export const buildDateFilter = (
  from,
  to
) => {
  if (!from || !to) {
    return null;
  }

  const start = new Date(from);

  const end = new Date(to);

  end.setDate(end.getDate() + 1);

  return {
    $gte: start,
    $lt: end,
  };
};