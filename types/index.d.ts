import { Connection, ConnectionPool, ConnectionPoolConfig, Transaction } from "@databases/mysql";
import { SQL } from "@databases/sql";
import { FastifyPluginCallback } from "fastify";

interface FastifyAtMysqlPluginOptions extends ConnectionPoolConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  name?: string;
}

declare const fastifyAtMysql: FastifyPluginCallback<FastifyAtMysqlPluginOptions>;

type QueryType = "raw" | "iterable" | "stream";

type QueryOptions = {
  type?: QueryType;
};

type MysqlInstance = {
  query<T>(query: string, options?: QueryOptions): QueryOptions["type"] extends "iterable"
    ? AsyncIterable<T>
    : QueryOptions["type"] extends "stream"
    ? NodeJS.ReadableStream
    : Promise<T[]>;
  transaction<T>(fn: (connection: Transaction) => Promise<T>): Promise<T>;
  task<T>(fn: (connection: Connection | Transaction) => Promise<T>): Promise<T>;
  sql: SQL;
  db: ConnectionPool;
};

declare module "fastify" {
  interface FastifyInstance {
    mysql: MysqlInstance & {
      [instanceName: string]: MysqlInstance;
    };
  }
}

export { fastifyAtMysql as default };
export { fastifyAtMysql };
