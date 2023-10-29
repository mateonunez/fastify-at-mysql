'use strict'

const fp = require('fastify-plugin')
const createConnectionPool = require('@databases/mysql')
const { buildConnectionString, validateConnectionString } = require('./lib/connection-string')

function validateOptions (options) {
  if (options.connectionString) {
    if (!validateConnectionString(options.connectionString)) {
      throw new Error('Invalid connection string')
    }
  } else if (!options.host || !options.user || !options.password || !options.database) {
    throw new Error('Missing connection options')
  }
}

async function fastifyAtMysql (fastify, options) {
  const { sql } = createConnectionPool
  const results = []

  async function executeTransaction (cb) {
    if (Array.isArray(cb)) {
      for (const tx of cb) {
        if (typeof tx !== 'function') {
          throw new Error('Transaction must be a function')
        }

        const result = await executeTransaction(tx)
        results.push(result)
      }

      return results
    } else if (typeof cb !== 'function') {
      throw new Error('Transaction must be a function')
    }

    return db.tx(cb)
  }

  const { host, user, password, database, port = 3306, connectionString = null, name = null } = options

  validateOptions({ host, user, password, database, port, connectionString })

  const db = createConnectionPool({
    connectionString: connectionString || buildConnectionString({ host, user, password, database, port })
  })

  fastify.addHook('onClose', (_, done) => {
    db.dispose().then(done)
  })

  const decoratorObject = {
    query: (queryString, options = {}) => {
      const { type = 'raw' } = options
      if (type === 'raw') {
        return db.query(sql(queryString))
      } else if (type === 'iterable') {
        return db.queryStream(sql(queryString))
      } else if (type === 'stream') {
        return db.queryNodeStream(sql(queryString))
      }

      throw new Error(`Invalid result type '${type}'`)
    },
    transaction: (...args) => executeTransaction(...args),
    task: (...args) => db.task(...args),
    sql,
    db
  }

  if (name) {
    if (!fastify.mysql) {
      fastify.decorate('mysql', {})
    }

    if (fastify.mysql[name]) {
      throw new Error(`fastify-mysql has already been registered with name '${name}'`)
    }

    fastify.mysql[name] = decoratorObject
  } else {
    if (fastify.mysql) {
      throw new Error('fastify-mysql or another mysql plugin has already been registered')
    }

    fastify.decorate('mysql', decoratorObject)
  }
}

module.exports = fp(fastifyAtMysql, {
  fastify: '4.x',
  name: 'fastify-mysql'
})

module.exports.default = fastifyAtMysql
module.exports.fastifyAtMysql = fastifyAtMysql
