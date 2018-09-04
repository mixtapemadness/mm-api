var _ = require('lodash')

module.exports = function(Model) {
  var schemaQuery = {}
  // if (Model.schema.options.query) {
  //   schemaQuery = Model.schema.options.query
  // }

  /**
   * Get all items by filter or one item by id
   * @param req
   * @param res
   */
  function httpGet (req, res, options = {}) {
    if (req.params.id !== undefined) {
      return findById(req, res, options)
    } else {
      return list(req, res, options)
    }
  }

  /**
   * Get Count by filter
   * @param req
   * @param res
   */
  function count (req, res, options = {}) {
    var requestQuery = req.query

    var query = Model.find()

    query.where(getWhere(requestQuery, options))

    query.count()
      .then((count) => {
        return res.ok({count})
      })
      .catch((err) => {
        return res.serverError(err)
      })
  }

  /**
   * Get Total Page by filter
   * @param req
   * @param res
   */
  function totalPage (req, res, options = {}) {
    let requestQuery = req.query

    let query = Model.find()

    let pageSize = getPageSize(requestQuery, options)

    query.where(getWhere(requestQuery, options))

    query.count()
      .then((count) => {
        var totalPage = 1
        if (pageSize) {
          totalPage = Math.ceil(count / pageSize)
        }
        return res.ok(totalPage)
      })
      .catch((err) => {
        return res.serverError(err)
      })
  }

  /**
   * Create new Item
   * @param req
   * @param res
   */
  function httpPost (req, res, options = {}) {
    removeReadOnlyFieldFromBody(req)
    let item = new Model(req.body)

    for (let key in req.files) {
      item[key] = req.files[key].name
    }

    if (req.user) {
      item.owner = req.user._id
    }
    item.save()
      .then((item) => {
        if (options.succussPromises && options.succussPromises.length > 0) {
          options.succussPromises.map((func) => func(item))
        }
        return res.created(item)
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          return res.badRequest(err.errors)
        }
        return res.badRequest(err)
      })
  }

  /**
   *  Update an Item with a given Id
   * @param req
   * @param res
   */
  function httpPut (req, res, options = {}) {
    const checkPermission = options.permission || function() { return true }
    let oldItem = {}
    removeReadOnlyFieldFromBody(req)
    if (!req.params.id) {
      return res.badRequest('id is undefined')
    }
    Model.findById(req.params.id)
      .then((item) => {
        if (!item) {
          throw new Error('Item not found!')
        }
        oldItem = item.toJSON()
        const result = checkPermission(item, req.user, res)
        if (typeof result !== 'boolean') {
          throw new Error('Permission Error')
        }

        item.set(req.body)

        for (var key in req.files) {
          item[key] = req.files[key].name
        }

        if (req.user) {
          item.modifierUser = req.user._id
        }

        return item.save()
      })
      .then((item) => {
        if (options.succussPromises && options.succussPromises.length > 0) {
          options.succussPromises.map((func) => func(item, oldItem))
        }
        return res.ok(item)
      })
      .catch((err) => {
        if (err.message === 'Permission Error') {
          return
        }
        if (err.name === 'ValidationError') {
          return res.badRequest(err.errors)
        }

        if (err.message === 'Item not found!') {
          return res.notFound('Item not found!')
        }

        return res.badRequest(err)
      })
  }

  /**
   * Get all items by filter
   * @param req
   * @param res
   */
  function list (req, res, options = {}) {
    let requestQuery = req.query

    let query = Model.find()

    var pageSize = parseInt(getPageSize(requestQuery, options))
    if (pageSize) {
      let page = parseInt(requestQuery.page === '{page}' ? 1 : requestQuery.page)
      let skip = (page - 1) * pageSize
      if (skip > 0) {
        query.skip((page - 1) * pageSize)
      }
      query.limit(pageSize)
    } else {
      let skip = parseInt(getSkip(requestQuery, options))
      if (skip) {
        query.skip(skip)
      }

      let limit = parseInt(getLimit(requestQuery, options))
      if (limit) {
        query.limit(limit)
      }
    }

    query.where(getWhere(requestQuery, options))

    var select = getSelect(requestQuery, options)
    if (select) {
      query.select(select)
    }

    if (options.sort) {
      query.sort(options.sort)
    } else if (requestQuery.sort !== undefined && requestQuery.sort !== '{sort}') {
      query.sort(requestQuery.sort)
    }

    if (options.populate) {
      for (let i = 0; i < options.populate.length; i++) {
        query.populate(options.populate[i])
      }
    }

    if (schemaQuery.populate) {
      for (let j = 0; j < schemaQuery.populate.length; j++) {
        query.populate(schemaQuery.populate[j])
      }
    }

    if (requestQuery.populate && requestQuery.populate !== '{populate}') {
      let list = requestQuery.populate
      if (typeof requestQuery.populate === 'string') {
        list = requestQuery.populate.split(',').map(String)
      }
      for (let l = 0; l < list.length; l++) {
        query.populate(list[l])
      }
    }

    if (requestQuery.distinct) {
      query.distinct(requestQuery.distinct)
    }

    let promises = [query.exec()]

    if (requestQuery.count) {
      let queryCount = Model.count()
      queryCount.where(getWhere(requestQuery, options))
      promises.push(queryCount)
    }

    return Promise.all(promises)
      .then((result) => {
        let response = {
          items: result[0]
        }
        if (result.length > 1) {
          response.totalCount = result[1]
        }
        if (options.promise) {
          return Promise.resolve(response)
        } else {
          return res.ok(response)
        }
      })
      .catch((err) => {
        return res.serverError(err)
      })
  }

  /**
   * Delete and Item by Id
   * @param req
   * @param res
   */
  function httpDelete (req, res, options = {}) {
    const checkPermission = options.permission || function() { return true }
    if (!req.params.id) {
      return res.badRequest('id is undefined')
    }

    Model.findById(req.params.id)
      .then((item) => {
        if (!item) {
          return res.notFound('Item not found')
        }

        const result = checkPermission(item, req, res)
        if (typeof result !== 'boolean') {
          throw new Error('Permission Error')
        }

        return item.remove()
      })
      .then(() => {
        return res.ok('Deleted')
      })
      .catch((err) => {
        if (err.message === 'Permission Error') {
          return
        }
        return res.badRequest(err)
      })
  }

  /**
   * get limit by priority (schemaQuery.limit, options.limit, request.limit)
   * @param requestQuery
   * @param options
   * @returns {int}
   */
  function getLimit (requestQuery, options = {}) {
    var limit = null
    if (schemaQuery.limit) {
      limit = schemaQuery.limit
    }

    if (options.limit && !isNaN(options.limit)) {
      if (!limit || options.limit < limit) {
        limit = options.limit
      }
    }

    if (requestQuery.limit && !isNaN(requestQuery.limit)) {
      if (!limit || requestQuery.limit < limit) {
        limit = requestQuery.limit
      }
    }
    return limit
  }

  /**
   * get skip by priority (schemaQuery.skip, options.skip, request.skip)
   * @param requestQuery
   * @param options
   * @returns {int}
   */
  function getSkip (requestQuery, options = {}) {
    var skip = null
    if (schemaQuery.skip) {
      skip = schemaQuery.skip
    }

    if (options.skip && !isNaN(options.skip)) {
      if (!skip || options.skip < skip) {
        skip = options.skip
      }
    }

    if (requestQuery.skip && !isNaN(requestQuery.skip) && requestQuery.skip !== '{skip}') {
      if (!skip || requestQuery.skip < skip) {
        skip = requestQuery.skip
      }
    }
    return skip
  }

  /**
   * get skip by priority (schemaQuery.pageSize, options.pageSize, request.pageSize)
   * @param requestQuery
   * @param options
   * @returns {int}
   */
  function getPageSize (requestQuery, options = {}) {
    var pageSize = null
    if (schemaQuery.pageSize) {
      pageSize = schemaQuery.pageSize
    }
    if (options.pageSize) {
      pageSize = options.pageSize
    }
    if (requestQuery.pageSize && requestQuery.pageSize !== '{pageSize}') {
      pageSize = requestQuery.pageSize
    }

    // if (options.pageSize && !isNaN(options.pageSize)) {
    //   if (!pageSize || options.pageSize < pageSize) {
    //     pageSize = options.pageSize
    //   }
    // }
    // if (requestQuery.pageSize && !isNaN(requestQuery.pageSize)) {
    //   if (!pageSize || requestQuery.pageSize < pageSize) {
    //     pageSize = requestQuery.pageSize
    //   }
    // }
    return pageSize
  }

  /**
   * get skip by priority (schemaQuery.where, options.where, request.where)
   * @param requestQuery
   * @param options
   * @returns {int}
   */
  function getWhere (requestQuery, options = {}) {
    var where = {}

    if (requestQuery.where !== undefined && requestQuery.where !== '{where}') {
      if (typeof requestQuery.where === 'object') {
        // where = requestQuery.where
        where = fixBooleans(requestQuery.where)
      } else {
        where = JSON.parse(requestQuery.where)
      }
    }

    // console.log(requestQuery.where)
    // for (var key in where) {
    //   if (where.hasOwnProperty(key)) {
    //     var element = where[key];
    //     if (typeof element == "object") {
    //       for (var i in element) {
    //         if (element.hasOwnProperty(i)) {
    //           if(element[i]=="true" || element[i]=="false") {
    //             where[key][i] = Boolean(element)
    //           }

    //         }
    //       }
    //     } else {
    //       if(element=="true" || element=="false") {
    //         where[key] = Boolean(element)
    //       }
    //     }
    //   }
    // }

    if (schemaQuery.where) {
      where = _.merge(where, schemaQuery.where)
    }

    if (options.where) {
      where = _.merge(where, options.where)
    }

    return where
  }

  /**
   * get skip by priority (schemaQuery.select, options.select, request.select)
   * @param requestQuery
   * @param options
   * @returns {int}
   */
  function getSelect (requestQuery, options = {}) {
    var select = null
    if (options.select) {
      select = options.select
    }

    if (requestQuery.select !== undefined && requestQuery.select !== '{select}') {
      if (select != null) {
        var result = _.intersectionWith(select.split(' '), requestQuery.select.split(' '), _.isEqual)
        select = result.join(' ')
      } else {
        select = requestQuery.select
      }
    }

    if (select === '' && options.select) {
      select = options.select
    }

    if (schemaQuery.select) {
      if (select != null) {
        var equal = _.intersectionWith(select.split(' '), schemaQuery.select.split(' '), _.isEqual)
        select = equal.join(' ')
      } else {
        select = schemaQuery.select
      }
    }

    if (select === '' && schemaQuery.select) {
      select = schemaQuery.select
    }

    // TODO if contains , then replave commas
    return select
  }

  /**
   * Get Item by Id
   * @param req
   * @param res
   */
  function findById (req, res, options = {}) {
    let requestQuery = req.query
    let select = getSelect(requestQuery, options)
    let where = {
      _id: req.params.id
    }

    if (options.where) {
      where = _.merge(where, options.where)
    }

    let query = Model.findOne(where, select)
    if (options.populate) {
      for (let i = 0; i < options.populate.length; i++) {
        query.populate(options.populate[i])
      }
    }

    if (schemaQuery.populate) {
      for (let j = 0; j < schemaQuery.populate.length; j++) {
        query.populate(schemaQuery.populate[j])
      }
    }

    if (requestQuery.populate && requestQuery.populate !== '{populate}') {
      let list = requestQuery.populate
      if (typeof requestQuery.populate === 'string') {
        list = requestQuery.populate.split(',').map(String)
      }
      for (let l = 0; l < list.length; l++) {
        query.populate(list[l])
      }
    }

    query.exec()
      .then((item) => {
        if (!item) {
          return res.notFound()
        }
        return res.ok(item)
      })
      .catch((err) => {
        return res.badRequest(err)
      })
  }

  function removeReadOnlyFieldFromBody (req) {
    delete req.body.owner
    delete req.body.modifierUser
    delete req.body.created
    delete req.body.modified
  }

  function fixBooleans (obj) {
    for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (typeof obj[property] === 'object') {
          fixBooleans(obj[property])
        } else {
          if (obj[property] == 'true' || obj[property] == 'false') {
            obj[property] = Boolean(obj[property])
          }
        }
      }
    }
    return obj
  }

  return {
    httpGet: httpGet,
    httpPost: httpPost,
    httpPut: httpPut,
    httpDelete: httpDelete,
    count: count,
    totalPage: totalPage
  }
}
