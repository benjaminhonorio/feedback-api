const { FILTER_OPTIONS, SORT_OPTIONS, PAGINATION_OPTIONS } = require('../server/config')

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
  // Filter query params to valid filter options
  // We could also destructure directly like {tag} instead of fields
  // But this way we can change filter options without touching the code
  // only by adding config as ENV variables for example

  const queryFields = Object.getOwnPropertyNames(fields)
  const curatedQueryFields = queryFields.filter(field =>
    FILTER_OPTIONS.includes(field)
  )
  if (!curatedQueryFields) return {}

  const filters = curatedQueryFields.reduce((acc, field) => {
    acc[field] = fields[field].toLowerCase()
    return acc
  }, {})
  return filters
}
