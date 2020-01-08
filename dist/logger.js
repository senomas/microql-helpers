"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
class LoggerMiddleware {
    async use({ context, info }, next) {
        const ps = [];
        for (let p = info.path; p; p = p.prev) {
            ps.unshift(p.key);
        }
        const path = ps.join(".");
        context.path = path;
        try {
            return await next();
        }
        catch (err) {
            config_1.logger.error({
                err,
                path,
                user: context.user
            }, 'graphql-error');
            throw err;
        }
    }
}
exports.LoggerMiddleware = LoggerMiddleware;
exports.LoggerResolverMiddleware = async ({ context, info, args }, next) => {
    const start = new Date();
    const t0 = process.hrtime();
    await next();
    const t1 = process.hrtime(t0);
    const end = new Date();
    config_1.logger.info({
        context,
        graphql: {
            path: context.path,
            [`args_${info.parentType.name}_${info.fieldName}`]: args,
            type: info.parentType.name
        },
        event: {
            dataset: "graphql-resolver",
            duration: t1[0] * 1000000000 + t1[1],
            start,
            end,
            kind: "event",
            category: "process"
        },
    }, 'graphql-resolver');
};
//# sourceMappingURL=logger.js.map