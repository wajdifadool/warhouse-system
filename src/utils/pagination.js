const getQuery = (Model, queryParams) => {
  const reqQuery = { ...queryParams }

  const removeFields = ['select', 'sort', 'page', 'limit', 'search']
  removeFields.forEach((param) => delete reqQuery[param])

  let queryStr = JSON.stringify(reqQuery)

  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`)

  let query = Model.find(JSON.parse(queryStr))

  // ?search=keyboard
  if (queryParams.search) {
    const search = queryParams.search.trim()

    query = Model.find({
      ...JSON.parse(queryStr),
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    })
  }

  if (queryParams.select) {
    query = query.select(queryParams.select.split(',').join(' '))
  }

  if (queryParams.sort) {
    query = query.sort(queryParams.sort.split(',').join(' '))
  } else {
    query = query.sort('-createdAt')
  }

  return {
    query,
    filter: JSON.parse(queryStr),
  }
}

const paginate = async (Model, queryParams) => {
  const { query, filter } = getQuery(Model, queryParams)

  const page = parseInt(queryParams.page, 10) || 1
  const limit = parseInt(queryParams.limit, 10) || 10

  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const total = await Model.countDocuments(filter)

  const products = await query.skip(startIndex).limit(limit)

  const pagination = {}

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    }
  }

  return {
    data: products,
    count: products.length,
    total,
    pagination,
  }
}

module.exports = {
  getQuery,
  paginate,
}
