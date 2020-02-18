"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const apollo_server_express_1 = require("apollo-server-express");
const express_1 = __importDefault(require("express"));
const shrink_ray_current_1 = __importDefault(require("shrink-ray-current"));
const authentication_1 = require("./authentication");
const authorization_1 = require("./authorization");
const buildFederatedSchema_1 = require("./buildFederatedSchema");
const config_1 = require("./config");
const logger_1 = require("./logger");
class BasicLogging extends apollo_server_express_1.GraphQLExtension {
    requestDidStart(o) {
        config_1.logger.info({ query: o.queryString, variables: o.variables }, 'graphql-request');
        o.context.event = {
            dataset: "graphql",
            t: process.hrtime(),
            start: new Date(),
            kind: "event",
            category: "process"
        };
    }
    willSendResponse({ context, graphqlResponse }) {
        const event = context.event;
        if (event) {
            event.end = new Date();
            const t = process.hrtime(event.t);
            event.duration = t[0] * 1000000000 + t[1];
            delete event.t;
        }
        config_1.logger.info({ gqlRes: graphqlResponse, event }, 'graphql-response');
    }
}
exports.BasicLogging = BasicLogging;
async function bootstrap({ resolvers, init, context }) {
    const schema = await buildFederatedSchema_1.buildFederatedSchema({
        resolvers,
        authChecker: authorization_1.customAuthChecker,
        globalMiddlewares: [logger_1.LoggerMiddleware],
        authMode: "null",
        emitSchemaFile: true,
        dateScalarMode: "isoDate"
    });
    await init();
    const server = new apollo_server_express_1.ApolloServer({
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
            const ctx = { headers: req.headers, remoteAddress, errors };
            ctx.user = await authentication_1.getUser(ctx, req);
            if (context) {
                await context(ctx);
            }
            return ctx;
        },
        extensions: [() => {
                return new BasicLogging();
            }]
    });
    const app = express_1.default();
    app.use(shrink_ray_current_1.default());
    server.applyMiddleware({ app });
    const port = parseInt(process.env.PORT, 10 || 4000);
    const bindAddress = process.env.BIND_ADDRESS || "0.0.0.0";
    const serverInfo = await app.listen(port, bindAddress);
    config_1.logger.info(Object.assign({ port, bindAddress }, serverInfo), "Server is running");
}
exports.bootstrap = bootstrap;
//# sourceMappingURL=server.js.map