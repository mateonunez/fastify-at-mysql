'use strict'

const fp = require('fastify-plugin')
const createConnectionPool = require('@databases/mysql')
const { buildConnectionString, validateConnectionString } = require('./lib/connection-string')

async function fastifyAtMysql (fastify, options) {
  const { host, user, password, database, port = 3306, connectionString = null, name = null } = options

  console.log({ connectionString })

  if (connectionString) {
    if (!validateConnectionString(connectionString)) {
      throw new Error('Invalid connection string')
    }
  } else if (!host || !user || !password || !database) {
    throw new Error('Missing connection options')
  }

  const { sql } = createConnectionPool
  const db = createConnectionPool({
    connectionString: connectionString || buildConnectionString({ host, user, password, database, port })
  })

  fastify.addHook('onClose', (_, done) => {
    db.dispose().then(done)
  })

  async function executeTransaction (queries) {
    const transactionResult = await db.tx(async () => {
      const results = []
      for (const query of queries) {
        const result = await db.query(sql(query))
        results.push(result[0].result)
      }
      return results
    })

    return transactionResult
  }

  const decoratorObject = {
    query: async (queryString) => await db.query(sql(queryString)),
    transaction: async (queryArray) => await executeTransaction(queryArray),
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
