'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const fastifyAtMysql = require('..')
const { same } = require('tap')

const options = {
  host: 'localhost',
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

test('fastify-at-mysql can connect to a MySQL database', ({ error, ok, plan }) => {
  plan(2)

  const fastify = Fastify()
  fastify.register(fastifyAtMysql, options)

  fastify.ready(async (err) => {
    error(err)

    const result = await fastify.mysql.query('SELECT NOW()')
    ok(result.length)

    fastify.close()
  })
})

test('fastify-at-mysql can connect to a MySQL database with a connection string', ({ error, ok, plan }) => {
  plan(2)

  const fastify = Fastify()
  fastify.register(fastifyAtMysql, { connectionString: 'mysql://root:toor@localhost:3306/test' })

  fastify.ready(async (err) => {
    error(err)

    const result = await fastify.mysql.query('SELECT NOW()')
    ok(result.length)

    fastify.close()
  })
})

test('should works with multiple instances', ({ error, ok, plan }) => {
  plan(3)
  const fastify = Fastify()

  fastify.register(fastifyAtMysql, { ...options, name: 'first_db' })
  fastify.register(fastifyAtMysql, { ...options, name: 'second_db' })

  fastify.ready(async (err) => {
    error(err)

    const resultFirst = await fastify.mysql.first_db.query('SELECT NOW()')
    ok(resultFirst.length)

    const resultSecond = await fastify.mysql.second_db.query('SELECT NOW()')
    ok(resultSecond.length)

    fastify.close()
  })
})

test('should throw with missing options', ({ ok, same, plan }) => {
  plan(2)
  const fastify = Fastify()

  fastify.register(fastifyAtMysql)

  fastify.ready((errors) => {
    ok(errors)
    same(errors.message, 'Missing required options')
    fastify.close()
  })
})

test('should throw with invalid connection string', ({ ok, same, plan }) => {
  plan(2)
  const fastify = Fastify()

  fastify.register(fastifyAtMysql, { connectionString: 'mysql:\\novalid@localhost:3306' })

  fastify.ready((errors) => {
    ok(errors)
    same(errors.message, 'Invalid connection string')
    fastify.close()
  })
})

test('should throw with multiple instances and same name', ({ ok, same, plan }) => {
  plan(2)
  const fastify = Fastify()

  fastify.register(fastifyAtMysql, { ...options, name: 'first_db' })
  fastify.register(fastifyAtMysql, { ...options, name: 'first_db' })

  fastify.ready((errors) => {
    ok(errors)
    same(errors.message, "fastify-mysql has already been registered with name 'first_db'")
    fastify.close()
  })
})

test('should throw without name option and multiple instances', ({ ok, same, plan }) => {
  plan(2)
  const fastify = Fastify()

  fastify.register(fastifyAtMysql, { ...options })
  fastify.register(fastifyAtMysql, { ...options })

  fastify.ready((errors) => {
    ok(errors)
    same(errors.message, 'fastify-mysql or another mysql plugin has already been registered')
    fastify.close()
  })
})

test('should create a single query and execute it with the transaction() method', ({ error, ok, plan }) => {
  plan(2)

  const fastify = Fastify()
  fastify.register(fastifyAtMysql, { ...options, name: 'first_db' })

  fastify.ready(async (err) => {
    error(err)

    const queryArray = ['SELECT NOW()']

    const result = await fastify.mysql.first_db.transaction(queryArray)
    ok(result.length)

    fastify.close()
  })
})

test('should create an array of queries and execute it with the transaction() method', ({ error, ok, plan }) => {
  plan(2)

  const fastify = Fastify()
  fastify.register(fastifyAtMysql, { ...options, name: 'first_db' })

  fastify.ready(async (err) => {
    error(err)

    const queryArray = ['SELECT 1+1 as result;', 'SELECT 4+4 as result;']

    const result = await fastify.mysql.first_db.transaction(queryArray)

    ok(result.length)

    same(result[0], 2)
    same(result[1], 8)

    fastify.close()
  })
})
