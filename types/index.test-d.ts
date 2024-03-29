import fastify from 'fastify'
import fastifyAtMysql from '..'
import { expectType } from 'tsd'

const app = fastify()

app
  .register(fastifyAtMysql, {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'toor',
    database: 'test',
  })
  .after((err) => {
    app.mysql.query('SELECT * FROM users')
    expectType<Promise<any[]>>(app.mysql.query('SELECT * FROM users'))
    expectType<Promise<any[]>>(app.mysql.transaction((conn) => conn.query(app.mysql.sql`SELECT * FROM users`)))
    expectType<Promise<any[]>>(app.mysql.task((conn) => conn.query(app.mysql.sql`SELECT * FROM users`)))
    expectType<Promise<void>>(app.mysql.db.dispose())
    app.mysql.db.dispose()
  })
