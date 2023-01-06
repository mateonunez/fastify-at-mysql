'use strict'

const fp = require('fastify-plugin')
const createConnectionPool = require('@databases/mysql')
const { buildConnectionString, validateConnectionString } = require('./lib/connection-string')

function fastifyMysql (fastify, options, next) {
  const { host, user, password, database, port = 3306, connectionString = null, name = null } = options
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

  fastify.addHook('onClose', (_, done) => {
    db.dispose().then(() => done()).catch(done)
  })

  // queryString needs to be explored to check if
  /*
  - It's safe to use
  - It regards a batch
      - If so I need to change the connectionpool configs to avoid graceful degradation based on the batch size and type of query (mods and insertions have double weight)
  - Otherwise no issue nothing to see here move along sir
  - And I send back the whole thing to the framework ready to execute, so I need to have a
   */

  const transactionMethod = async (queryArray) => {
    const maxBatchSizeBeforeSplitting = 2000
    const maxBatchSizeBeforeDegradation = 1000

    if (Array.isArray(queryArray)) {
      return await db.tx(async () => {
        try {
          const chunkSize = queryArray.length > maxBatchSizeBeforeSplitting ? maxBatchSizeBeforeDegradation : queryArray.length // query chunk size (to adjust according to MySQL benchmarking)
          const entireResult = []
          for (let i = 0; i < queryArray.length; i += chunkSize) {
            const chunk = queryArray.slice(i, i + chunkSize)
            const partialResult = await db.query(sql(chunk))
            entireResult.push(partialResult)
          }
          return entireResult
        } catch (error) {
          console.log(error)
          throw error
        }
      })
    } else {
      throw new Error('The query array is not an array')
    }
    // need error handling, to define
  }

  const decoratorObject = {
    query: (queryString) => db.query(sql(queryString)),
    tx: (queryArray) => transactionMethod(queryArray),
    sql,
    db
  }

  if (name) {
    if (!fastify.mysql) {
      fastify.decorate('mysql', {})
    }

    if (fastify.mysql[name]) {
      return next(new Error(`fastify-mysql has already been registered with name '${name}'`))
    }

    fastify.mysql[name] = decoratorObject
  } else {
    if (fastify.mysql) {
      return next(new Error('fastify-mysql or another mysql plugin has already been registered'))
    }

    fastify.decorate('mysql', decoratorObject)
  }

  next()
}

module.exports = fp(fastifyMysql, {
  fastify: '4.x',
  name: 'fastify-mysql'
})

module.exports.default = fastifyMysql
module.exports.fastifyMysql = fastifyMysql
