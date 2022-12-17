# fastify-at-mysql

> Under development, use at your own risk.

![Continuous Integration](https://github.com/mateonunez/fastify-at-mysql/workflows/ci/badge.svg)

Fastify MySQL plugin using [@databases/mysql](https://www.atdatabases.org/docs/sql)

## Installation

```
npm install fastify-at-mysql
```

## Getting Started

The `fastify-at-mysql` plugin is a wrapper around the `@databases/mysql` package. It exposes the `mysql` property on the Fastify instance.

```js
const Fastify = require('fastify')
const fatsifyMysql = require('fastify-at-mysql')

const fastify = fastify()
fastify.register(fatsifyMysql, {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
})

fastify.get('/', async (request, reply) => {
  const result = await fastify.mysql.query('SELECT * FROM contributors')  
  reply.send(result)
})
```

The `query` method returns a `Promise` that resolves to an array of objects. Each object represents a row in the result set. It wraps the `sql` method from `@databases/mysql` package that prevents SQL injection attacks.

## Options

The plugin accepts the following options:

- `host` - The hostname of the database you are connecting to. (Default: `localhost`)
- `port` - The port number to connect to. (Default: `3306`)
- `user` - The MySQL user to authenticate as.
- `password` - The password of that MySQL user.
- `database` - Name of the database to use for this connection (Optional).

## License

**fastify-at-mysql** is licensed under the [MIT](LICENSE) license.
