import { MemStore } from './mem-store';
import { EnvData } from './../env-data/env-data';
import { UtilityBelt } from "../components/utility-belt/utility-belt";
import cors from '@fastify/cors'
import { fastify, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { fetch } from 'undici';
import fs from 'fs-extra';


const uBelt = new UtilityBelt('AppServer');

uBelt.logDebug('Starting...');

const f: FastifyInstance = fastify({
  genReqId(req) { return UtilityBelt.genUrlSafeUUID(); },
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        ignore: 'req.pid,req.hostname,req.remoteAddress,req.remotePort',
        translateTime: 'SYS:h:MM:ss TT Z o',
      },
    },
  }
});


async function run() {
  const startMs = Date.now();

  await MemStore.init();

  await f.register(import('@fastify/compress'), { global: true });
  await f.register(cors, { origin: true });

  f.get('/health', { logLevel: 'warn' }, async (request, reply) => {
    let resp: any = {};
    resp.uptime = UtilityBelt.getPrettyUptime();

    return reply.send(UtilityBelt.pretty(resp, 2));
  });


  // Run the server!
  const start = async () => {
    try {
      await f.listen({ 
        port: Number.parseInt(EnvData.serverPort),
        host: '0.0.0.0',
      });
    } catch (err) {
      f.log.error(err);
      process.exit(4);
    }
  }
  start();

}







run();