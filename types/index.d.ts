import { ConnectionPool, ConnectionPoolConfig } from "@databases/mysql";
import { SQL } from "@databases/sql";
import { FastifyPluginCallback } from "fastify";

interface FastifyAtMysqlPluginOptions extends ConnectionPoolConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

declare const fastifyAtMysql: FastifyPluginCallback<FastifyAtMysqlPluginOptions>;

type Queryable = {
  mysql: {
    query<T>(query: string): Promise<T[]>;
    transaction<T>(queries: string[]): Promise<T>;
    sql: SQL;
    db: ConnectionPool;
  };
};

declare module "fastify" {
  interface FastifyInstance {
    mysql: Queryable["mysql"];
  }
}

export { fastifyAtMysql as default };
export { fastifyAtMysql };
