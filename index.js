'use strict'

const fp = require('fastify-plugin')
const createConnectionPool = require('@databases/mysql')
const { buildConnectionString, validateConnectionString } = require('./lib/connection-string')

function fastifyMysql (fastify, options, next) {
  if (fastify.mysql) {
    return next(new Error('fastify-mysql or another mysql plugin has already been registered'))
  }

  const { host, user, password, database, port = 3306, connectionString = null } = options
  if (connectionString) {
    if (!validateConnectionString(connectionString)) {
      return next(new Error('Invalid connection string'))
    }
  } else if (!host || !user || !password || !database) {
    return next(new Error('Missing required options'))
  }

  const { sql } = createConnectionPool
  const db = createConnectionPool({
    connectionString: connectionString || buildConnectionString({ host, user, password, database, port })
  })

  fastify.decorate('mysql', {
    query: (queryString) => db.query(sql(queryString)),
    close: () => db.dispose(),
    sql,
    db
  })

  next()
}

module.exports = fp(fastifyMysql, {
  fastify: '4.x',
  name: 'fastify-mysql'
})

module.exports.default = fastifyMysql
module.exports.fastifyMysql = fastifyMysql
