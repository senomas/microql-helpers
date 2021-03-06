import 'reflect-metadata';
import { ApolloServer, GraphQLExtension } from 'apollo-server-express';
import express from 'express';
import shrinkRay from 'shrink-ray-current';
import fs = require("fs");
import path = require("path");

import { getUser } from './authentication';
import { customAuthChecker } from './authorization';
import { buildFederatedSchema } from './buildFederatedSchema';
import { config, logger, NODE_ENV } from './config';
import { LoggerMiddleware } from './logger';
import { mongodb } from './mongodb';

export class BasicLogging extends GraphQLExtension {
  public requestDidStart(o) {
    logger.info({ query: o.queryString, variables: o.variables }, 'graphql-request');
    o.context.event = {
      dataset: "graphql",
      t: process.hrtime(),
      start: new Date(),
      kind: "event",
      category: "process"
    };
  }

  public willSendResponse({ context, graphqlResponse }) {
    const event = context.event;
    if (event) {
      event.end = new Date();
      const t = process.hrtime(event.t);
      event.duration = t[0] * 1000000000 + t[1];
      delete event.t;
    }
    logger.info({ gqlRes: graphqlResponse, event }, 'graphql-response');
  }
}

export async function bootstrap(
  {
    resolvers,
    init,
    context
  }: {
    resolvers?: any,
    init?: () => void,
    context?: (any) => void
  }
) {
  const schema = await buildFederatedSchema({
    resolvers,
    authChecker: customAuthChecker,
    globalMiddlewares: [LoggerMiddleware],
    authMode: "null",
    emitSchemaFile: true,
    dateScalarMode: "isoDate"
  });

  await mongodb.init(config);
  await init();

  const data = fs.readdirSync(path.resolve("./dist/data"));
  data.sort();
  const models = {};
  for (const fn of data) {
    const fns = fn.split(".");
    const model = fns[1];
    if (NODE_ENV === "development" || NODE_ENV === "test") {
      if (!models[model]) {
        try {
          await mongodb.db.collection(model).drop();
        } catch (err) {
          if (err.message && err.message.indexOf("ns not found") >= 0) {
            // skip
          } else {
            throw err;
          }
        }
        models[model] = true;
      }
    }
    if (fn.endsWith(".js")) {
      const cfn = path.resolve("dist", "data", fn.slice(0, -3));
      logger.info({ model, fileName: cfn }, "import script");
      await require(cfn)({ mongodb });
    } else if (fn.endsWith(".json")) {
      logger.info({ model, fileName: fn }, "load data");
      const pdata = JSON.parse(fs.readFileSync(path.resolve("dist", "data", fn)).toString());
      const res = await mongodb.models[model].load(pdata);
      logger.info({ model, fileName: fn, res }, "load data res");
    }
  }

  const server = new ApolloServer({
    schema,
    playground: true,
    formatError: err => {
      if (err.message && err.message.startsWith("Context creation failed: ")) {
        err.message = err.message.substr(25);
      }
      return err;
    },
    context: async ({ req }) => {
      const remoteAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const errors = [];
      const ctx: any = { headers: req.headers, remoteAddress, errors };
      ctx.user = await getUser(ctx, req);
      if (context) {
        await context(ctx);
      }
      return ctx;
    },
    extensions: [() => {
      return new BasicLogging();
    }]
  });

  const app = express();
  app.use(shrinkRay());
  server.applyMiddleware({ app });

  const port = parseInt(process.env.PORT, 10 || 4000);
  const bindAddress = process.env.BIND_ADDRESS || "0.0.0.0";
  const serverInfo = await app.listen(port, bindAddress);
  logger.info({ port, bindAddress, ...serverInfo }, "Server is running");
}
