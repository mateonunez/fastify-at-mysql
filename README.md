# fastify-at-mysql

![Continuous Integration](https://github.com/mateonunez/fastify-at-mysql/workflows/ci/badge.svg)

Fastify MySQL alternative plugin.

## Installation

```
npm install fastify-at-mysql
```

## Why?

There are several reasons why you might want to consider using a Fastify plugin to integrate a MySQL database in a secure way and prevent SQL injections:

- Security: By using a plugin that is designed specifically to prevent SQL injections, you can protect your application from one of the most common types of cyber attacks. This is particularly important if you are handling sensitive data or financial transactions.
- Simplicity: Using a plugin can make it easier to integrate a MySQL database into your Fastify application. Rather than having to write custom code to handle database connections and queries, you can simply install the plugin and use its API to interact with the database.
- Performance: A good plugin will be optimized for performance and can help you get the most out of your MySQL database. This can be particularly important if you are working with large datasets or need to handle a high volume of requests.
- Ecosystem: By using a plugin, you can take advantage of the Fastify ecosystem and leverage the work of the community. This can save you time and effort, as you don't have to reinvent the wheel or write custom code for every aspect of your application.


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

The `query` property autimatically wraps the `sql` method. It gives you a powerful and flexible way of creating queries without opening yourself to SQL Injection attacks. [Read more here](https://www.atdatabases.org/docs/sql)

The exposed object from the plugin is:

```
const db = {
  query,  // use this to create queries in a simple way
  sql,    // method to create queries in a safe-way
  db,     // database object
}
```

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
