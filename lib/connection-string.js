'use strict'

function buildConnectionString ({ host, user, password, database, port }) {
  return `mysql://${user}:${password}@${host}:${port}/${database}`
}

function validateConnectionString (connectionString) {
  const regex = /^mysql:\/\/([a-zA-Z0-9]+):([a-zA-Z0-9]+)@([a-zA-Z0-9]+):([0-9]+)\/([a-zA-Z0-9]+)$/
  return regex.test(connectionString)
}

module.exports = {
  buildConnectionString,
  validateConnectionString
}
