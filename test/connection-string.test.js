'use strict'

const t = require('tap')
const test = t.test
const { buildConnectionString, validateConnectionString } = require('../lib/connection-string')

test('buildConnectionString should return a valid connection string', ({ same, plan }) => {
  plan(1)

  const connectionString = buildConnectionString({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'toor',
    database: 'test'
  })

  same(connectionString, 'mysql://root:toor@localhost:3306/test')
})

test('validateConnectionString should return true for a valid connection string', ({ ok, plan }) => {
  plan(1)

  const connectionString = buildConnectionString({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'toor',
    database: 'test'
  })

  ok(validateConnectionString(connectionString))
})

test('validateConnectionString should return false for an invalid connection string', ({ notOk, plan }) => {
  plan(1)

  const connectionString = 'mysql:\\novalid@localhost:3306'

  notOk(validateConnectionString(connectionString))
})
