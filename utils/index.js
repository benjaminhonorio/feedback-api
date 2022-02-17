const { SORT_OPTIONS, PAGINATION_OPTIONS } = require('../server/config')

exports.capitalizeFirstLetter = (v) => {
  // Convert 'bob' -> 'Bob'
  return v.charAt(0).toUpperCase() + v.substring(1)
}

exports.paginationParams = ({
  limit = PAGINATION_OPTIONS.limit,
  page = PAGINATION_OPTIONS.page,
  skip = PAGINATION_OPTIONS.skip
}) => {
  return {
    limit: Number(limit),
    page: Number(page),
    skip: skip ? Number(skip) : (Number(page) - 1) * Number(limit)
  }
}

const sortingParamsToString = (sortBy, direction) => {
  const dir = direction === 'desc' ? '-' : ''
  return `${dir}${sortBy}`
}

exports.getSortingParams = (
  {
    sortBy = SORT_OPTIONS.sortBy.default,
    direction = SORT_OPTIONS.direction.default
  },
  fields) => {
  const safeList = {
    sortBy: [
      ...Object.getOwnPropertyNames(fields),
      ...SORT_OPTIONS.sortBy.fields],
    direction: [...SORT_OPTIONS.direction.options]
  }
  const sortingStringQuery = sortingParamsToString(
    safeList.sortBy.includes(sortBy) ? sortBy : SORT_OPTIONS.sortBy.default,
    safeList.direction.includes(direction)
      ? direction
      : SORT_OPTIONS.direction.default
  )
  return sortingStringQuery
}

exports.getFilters = (fields) => {
  // const inputFields = Object.keys(fields)
  // console.log(inputFields)
  // const isNotSortOption = inputFields.filter(field => field !== 'sortBy' || field !== 'direction')
  // if (isNotSortOption.length) return {}
  return fields
}
