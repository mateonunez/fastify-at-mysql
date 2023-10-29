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

### Instance

```js
const db = {
  query,        // use this to create queries in a simple way
  transaction,  // use this to create transactions
  task,         // use this to create tasks
  sql,          // method to create queries in a safe-way
  db,           // database object
}
```

#### Query

The `query` property automatically wraps the `sql` method. It gives you a powerful and flexible way of creating queries without opening yourself to SQL Injection attacks. [Read more here](https://www.atdatabases.org/docs/sql)

```js
const result = await fastify.mysql.query(sql`SELECT * FROM contributors`)
```

You can also specify the type of the result between: `raw`, `iterator`, `stream`:

**Raw**
```js
const result = await fastify.mysql.query(sql`SELECT * FROM contributors`, { type: 'raw' }) // default
console.log(result) // [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
```

**Iterator**
```js
for await (const row of fastify.mysql.query(sql`SELECT * FROM contributors`, { type: 'iterator' })) {
  console.log(row) // { id: 1, name: 'John' }
}
```

**Stream**
```js
const { Transform } = require('node:stream')
const stringify = new Transform({
  writableObjectMode: true,
  transform (chunk, _, callback) {
    this.push(JSON.stringify(chunk) + '\n')
    callback()
  }
})

const stream = fastify.mysql.query(sql`SELECT * FROM contributors`, { type: 'stream' })
stream.pipe(stringify).pipe(process.stdout) // { id: 1, name: 'John' }
```


#### Transaction

The `transaction` function is used to execute multiple queries in a single transaction. [Read more here](https://www.atdatabases.org/docs/transactions)

```js
const txs = [
  (db) => db.query(fastify.mysql.sql`INSERT INTO contributors (name) VALUES ('John')`),
  (db) => db.query(fastify.mysql.sql`INSERT INTO contributors (name) VALUES ('Jane')`),
]

const result = await fastify.mysql.transaction(txs)
```

#### Task

The `task` function is used to execute a single set of operations as a single task. [Read more here](https://www.atdatabases.org/docs/tasks)

```js
const task = (db) => {
  return db.query(fastify.mysql.sql`INSERT INTO contributors (name) VALUES ('John')`)
}

const result = await fastify.mysql.task(task)
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
