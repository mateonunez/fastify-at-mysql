# fastify-at-mysql

> Under development, use at your own risk.

![Continuous Integration](https://github.com/mateonunez/fastify-at-mysql/workflows/ci/badge.svg)

Fastify MySQL plugin using [@databases/mysql](https://www.atdatabases.org/docs/sql)

## Installation

```
npm install fastify-at-mysql
```

## Getting Started

```js
const Fastify = require('fastify')
const fatsifyMysql = require('fastify-at-mysql')

const fastify = fastify()
fastify.register(fatsifyMysql, {
  host: '',
  user: '',
  password: '',
  database: '',
})

fastify.get('/', async (request, reply) => {
  const result = await fastify.mysql.query('SELECT 1 + 1 AS solution')
  reply.send(result)
})
```

## License

FastifyAtMysql is licensed under the [MIT](LICENSE) license.
