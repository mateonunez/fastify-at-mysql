import fastify from 'fastify'
import fastifyMysql from '..'

declare module 'fastify' {
  interface FastifyInstance {
    mysql: any
  }
}

const app = fastify()

app
  .register(fastifyMysql, {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'toor',
    database: 'test',
  })
  .after((err) => {
    app.mysql.query('SELECT NOW()')
    app.mysql.close()
  })