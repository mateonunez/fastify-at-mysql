'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const fastifyAtMysql = require('..')

const options = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'toor',
  database: 'test'
}

test('fastify-at-mysql is correctly defined', ({ ok, plan }) => {
  plan(1)

  const fastify = Fastify()
  fastify.register(fastifyAtMysql, options)

  fastify.ready(() => {
    ok(fastify.mysql)
    fastify.close()
  })
})

test('fastify-at-mysql can connect to a MySQL database', async ({ error, ok, plan, teardown }) => {
  teardown(() => {
    fastify.close()
  })

  const fastify = Fastify()
  await fastify.register(fastifyAtMysql, options)

  try {
    const result = await fastify.mysql.query('SELECT NOW()')
    ok(result.length)
  } catch (err) {
    error(err)
  }
})

test('fastify-at-mysql can connect to a MySQL database with a connection string', async ({ error, ok, teardown }) => {
  teardown(() => {
    fastify.close()
  })

  const fastify = Fastify()

  await fastify.register(fastifyAtMysql, { connectionString: 'mysql://root:toor@127.0.0.1:3306/test' })

  try {
    const result = await fastify.mysql.query('SELECT NOW()')
    ok(result.length)
  } catch (err) {
    error(err)
  }
})

test('should works with multiple instances', async ({ error, ok, teardown }) => {
  teardown(() => {
    fastify.close()
  })

  const fastify = Fastify()

  await fastify.register(fastifyAtMysql, { ...options, name: 'first_db' })
  await fastify.register(fastifyAtMysql, { ...options, name: 'second_db' })

  try {
    const results1 = await fastify.mysql.first_db.query('SELECT NOW()')
    ok(results1.length)
    const results2 = await fastify.mysql.second_db.query('SELECT NOW()')
    ok(results2.length)
  } catch (err) {
    error(err)
  }
})

test('should throw with missing options', async ({ ok, same, teardown }) => {
  teardown(() => {
    fastify.close()
  })

  const fastify = Fastify()

  try {
    await fastify.register(fastifyAtMysql)
  } catch (err) {
    same(err.message, 'Missing connection options')
  }
})

test('should throw with invalid connection string', async ({ ok, same, teardown }) => {
  teardown(() => {
    fastify.close()
  })
  const fastify = Fastify()

  try {
    await fastify.register(fastifyAtMysql, { connectionString: 'mysql:\\novalid@localhost:3306' })
  } catch (err) {
    same(err.message, 'Invalid connection string')
  }
})

test('should throw with multiple instances and same name', async ({ ok, same, teardown }) => {
  const fastify = Fastify()
  teardown(() => {
    fastify.close()
  })

  try {
    await fastify.register(fastifyAtMysql, { ...options, name: 'first_db' })
    await fastify.register(fastifyAtMysql, { ...options, name: 'first_db' })
  } catch (errors) {
    ok(errors)
    same(errors.message, "fastify-mysql has already been registered with name 'first_db'")
  }
})

test('should throw without name option and multiple instances', async ({ ok, same, teardown }) => {
  const fastify = Fastify()
  teardown(() => {
    fastify.close()
  })

  try {
    await fastify.register(fastifyAtMysql, { ...options })
    await fastify.register(fastifyAtMysql, { ...options })
  } catch (errors) {
    ok(errors)
    same(errors.message, 'fastify-mysql or another mysql plugin has already been registered')
  }
})

test('should create a single query and execute it with the transaction() method', async ({ error, ok, teardown }) => {
  const fastify = Fastify()
  teardown(() => {
    fastify.close()
  })

  await fastify.register(fastifyAtMysql, { ...options, name: 'first_db' })

  const queryArray = ['SELECT NOW()']
  try {
    const result = await fastify.mysql.first_db.transaction(queryArray)
    ok(result.length)
  } catch (err) {
    error(err)
  }
})

test('should create an array of queries and execute it with the transaction() method', async ({ error, ok, same, teardown }) => {
  const fastify = Fastify()
  teardown(() => {
    fastify.close()
  })

  await fastify.register(fastifyAtMysql, { ...options, name: 'first_db' })

  const queryArray = ['SELECT 1+1 as result;', 'SELECT 4+4 as result;']

  try {
    const result = await fastify.mysql.first_db.transaction(queryArray)
    ok(result.length)
    same(result[0], 2)
    same(result[1], 8)
  } catch (err) {
    error(err)
  }
})
