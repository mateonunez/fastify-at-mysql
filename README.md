# fastify-at-mysql

![Continuous Integration](https://github.com/mateonunez/fastify-at-mysql/workflows/ci/badge.svg)

Fastify MySQL alternative plugin.

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

### Exposed properties

```
const db = {
  query,// use this to create queries in a simple way
  transaction,//  use this to create transactions
  sql,    // method to create queries in a safe-way
  db,     // database object
}
```

#### Query
The `query` property automatically wraps the `sql` method. It gives you a powerful and flexible way of creating queries without opening yourself to SQL Injection attacks. [Read more here](https://www.atdatabases.org/docs/sql)


#### Transaction
The `transaction` property allows you to create a transaction that will be executed entirely or not at all. The underlying method accepts an array of queries. As with the `query` property, it automatically wraps the `sql` method to avoid SQL Injection attacks.
If you want to know more about the underlying implementation you can read the [transaction](https://www.atdatabases.org/docs/mysql-guide-transactions) documentation from @databases.



## Options

The plugin accepts the following options:

- `host` - The hostname of the database you are connecting to. (Default: `localhost`)
- `port` - The port number to connect to. (Default: `3306`)
- `user` - The MySQL user to authenticate as.
- `password` - The password of that MySQL user.
- `database` - Name of the database to use for this connection (Optional).
- `connectionString` - A connection string to use instead of the connection options. (Optional)
- `name` - Name of the database instance if you want to use multiple databases. (Optional)

## License

**fastify-at-mysql** is licensed under the [MIT](LICENSE) license.
