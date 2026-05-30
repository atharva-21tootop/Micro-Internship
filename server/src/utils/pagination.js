export const paginate = (items, page = 1, pageSize = 10) => {
  const safePage = Math.max(1, Number(page) || 1)
  const safeSize = Math.min(50, Math.max(1, Number(pageSize) || 10))
  const total = items.length
  const start = (safePage - 1) * safeSize

  return {
    data: items.slice(start, start + safeSize),
    pagination: {
      page: safePage,
      pageSize: safeSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeSize)),
    },
  }
}
