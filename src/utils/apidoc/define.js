
/**
 * @apiDefine Errors
 *
 * @apiError 400-BadRequest The request cannot be fulfilled due to bad syntax.
 * @apiError 401-Unauthorized Failed to authenticate token.
 * @apiError 403-Forbidden User not authorized to perform the operation.
 * @apiError 404-NotFound  The requested resource could not be found but may be available again in the future.
 * @apiError (Error 5xx) 500-ServerError Something bad happened on the server.
 *
 * @apiSuccessExample Response Errors
 *     HTTP/1.1 400 Bad Request
 *     {
 *       status: 400,
 *       name: 'badRequest',
 *       code: 'E_BAD_REQUEST',
 *       message: 'The request cannot be fulfilled due to bad syntax',
 *       data: {}
 *     }
 *
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       status: 401,
 *       name: 'unauthorized',
 *       code: 'E_UNAUTHORIZED',
 *       message: 'Missing or invalid authentication token',
 *       data: {}
 *     }
 *
 *     HTTP/1.1 403 Forbidden
 *     {
 *       status: 403,
 *       name: 'forbidden',
 *       code: 'E_FORBIDDEN',
 *       message: 'User not authorized to perform the operation',
 *       data: {}
 *     }
 *
 *     HTTP/1.1 404 Not Found
 *     {
 *       status: 404,
 *       name: 'notFound',
 *       code: 'E_NOT_FOUND',
 *       message: 'The requested resource could not be found but may be available again in the future',
 *       data: {}
 *     }
 *
 *     HTTP/1.1 500 ServerError
 *     {
 *       status: 500,
 *       name: 'serverError',
 *       code: 'E_INTERNAL_SERVER_ERROR',
 *       message: 'Something bad happened on the server',
 *       data: {}
 *     }
 */

/**
 * @apiDefine defaultQueryParams
 *
 * @apiParam {Number} [pageSize] The number of per page.
 * @apiParam {Number} [page] Page number start by 1.
 * @apiParam {Number} [skip] Not works with pageSize and page params.
 * @apiParam {Number} [limit] Not works with pageSize and page params.
 * @apiParam {String} [sort] Sort list by field. e.x. -name.
 * @apiParam {String} [select] which fields you want to be selected. e.x. _id name
 * @apiParam {String} [where] filter by your criteria. e.x. {"name":"seach_criteria"}
 * @apiParam {String[]} [populate] Populate object array. e.x.  'owner', 'company'
 * @apiParam {Bool} [count] return all items count.
 *
 */

/**
 * @apiDefine defaultSuccessExample200
 *
 * @apiSuccessExample Response success
 *     HTTP/1.1 200 OK
 *     {
 *        code: 'OK',
 *        message: 'Operation is successfully executed',
 *        data : {}
 *     }
 */

/**
 * @apiDefine defaultSuccessExample201
 *
 * @apiSuccessExample Response success
 *     HTTP/1.1 201 Created
 *     {
 *        code: 'CREATED',
 *        message: 'The request has been fulfilled and resulted in a new resource being created',
 *        data : {}
 *     }
 */
