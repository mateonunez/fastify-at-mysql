'use strict'

function buildConnectionString ({ host, user, password, database, port }) {
  const a = `mysql://${user}:${password}@${host}:${port}/${database}`
  return a
}

function validateConnectionString (connectionString) {
  const regex = /^mysql:\/\/([a-zA-Z0-9._%-]+):([a-zA-Z0-9._%-]+)@([a-zA-Z0-9.-]+):([0-9]+)\/([a-zA-Z0-9_]+)$/
  return regex.test(connectionString)
}

module.exports = {
  buildConnectionString,
  validateConnectionString
}
