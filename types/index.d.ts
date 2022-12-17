import { ConnectionPoolConfig } from "@databases/mysql";
import { FastifyPluginCallback } from "fastify";

type FastifyMysql = FastifyPluginCallback<fastifyMysql.MysqlOptions>

declare namespace fastifyMysql {
  export interface MysqlOptions extends ConnectionPoolConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  }

  export const fastifyMysql: FastifyMysql
  export { fastifyMysql as default }
}

declare function fastifyMysql(...params: Parameters<FastifyMysql>): ReturnType<FastifyMysql>
export = fastifyMysql
