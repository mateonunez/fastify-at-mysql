'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const fastifyMysql = require('..')

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
  fastify.register(fastifyMysql, options)

  fastify.ready(() => {
    ok(fastify.mysql)
    fastify.mysql.close()
    fastify.close()
  })
})

test('fastify-at-mysql can connect to a MySQL database', ({ error, ok, plan }) => {
  plan(2)

  const fastify = Fastify()
  fastify.register(fastifyMysql, options)

  fastify.ready(async (err) => {
    error(err)

    const result = await fastify.mysql.query('SELECT NOW()')
    ok(result.length)

    fastify.mysql.close()
    fastify.close()
  })
})

test('should throw with multiple instances', ({ ok, same, plan }) => {
  plan(2)
  const fastify = Fastify()

  fastify.register(fastifyMysql, options)
  fastify.register(fastifyMysql, options)

  fastify.ready((errors) => {
    ok(errors)
    same(errors.message, 'fastify-mysql or another mysql plugin has already been registered')
    fastify.close()
  })
})

test('should throw with missing options', ({ ok, same, plan }) => {
  plan(2)
  const fastify = Fastify()

  fastify.register(fastifyMysql)

  fastify.ready((errors) => {
    ok(errors)
    same(errors.message, 'Missing required options')
    fastify.close()
  })
})
