'use strict'

const fp = require('fastify-plugin')
const createConnectionPool = require('@databases/mysql')

function fastifyMysql (fastify, options, next) {
  if (fastify.mysql) {
    return next(new Error('fastify-mysql or another mysql plugin has already been registered'))
  }

  const { host, user, password, database, port = 3306 } = options
  if (!host || !user || !password || !database) {
    return next(new Error('Missing required options'))
  }

  const connectionString = __buildConnectionString({ host, user, password, database, port })
  const { sql } = createConnectionPool
  const db = createConnectionPool({
    connectionString
  })

  fastify.decorate('mysql', {
    query: (queryString) => db.query(sql(queryString)),
    close: () => db.dispose(),
    sql,
    db
  })

  next()
}

function __buildConnectionString ({ host, user, password, database, port }) {
  return `mysql://${user}:${password}@${host}:${port}/${database}`
}

module.exports = fp(fastifyMysql, {
  fastify: '4.x',
  name: 'fastify-mysql'
})

module.exports.default = fastifyMysql
module.exports.fastifyMysql = fastifyMysql
